using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;
using System.Text.Json;

namespace CrunchbaseExplorer.Server.Repositories;

public class PersonRepository : IPersonRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PersonRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResult<PersonListItemDto>> SearchAsync(
        PersonSearchRequest request, 
        CancellationToken cancellationToken = default)
    {
        const string sql = @"
            WITH FilteredPeople AS (
                SELECT 
                    e.EntityId, e.Uuid, e.DisplayName, e.Permalink, e.ImageUrl,
                    e.City, e.CountryCode,
                    p.PersonId, p.FirstName, p.LastName, p.Gender, 
                    p.PrimaryOrganizationId, p.PrimaryJobTitle,
                    po.DisplayName AS PrimaryOrganizationName,
                    ISNULL(m.RankPerson, 999999) AS RankPerson, 
                    ISNULL(m.NumJobs, 0) AS NumJobs, 
                    ISNULL(m.NumCurrentJobs, 0) AS NumCurrentJobs, 
                    ISNULL(m.NumFoundedOrganizations, 0) AS NumFoundedOrganizations,
                    ISNULL(m.NumInvestments, 0) AS NumInvestments, 
                    ISNULL(m.NumPartnerInvestments, 0) AS NumPartnerInvestments, 
                    ISNULL(m.NumEventAppearances, 0) AS NumEventAppearances, 
                    ISNULL(m.NumArticles, 0) AS NumArticles,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'RankPerson' AND @SortDirection = 'ASC' THEN ISNULL(m.RankPerson, 999999) END ASC,
                            CASE WHEN @SortColumn = 'RankPerson' AND @SortDirection = 'DESC' THEN ISNULL(m.RankPerson, 999999) END DESC,
                            CASE WHEN @SortColumn = 'Name' AND @SortDirection = 'ASC' THEN e.DisplayName END ASC,
                            CASE WHEN @SortColumn = 'Name' AND @SortDirection = 'DESC' THEN e.DisplayName END DESC,
                            e.EntityId ASC
                    ) AS RowNum
                FROM cb.Entity e
                INNER JOIN cb.Person p ON e.EntityId = p.PersonId
                LEFT JOIN cb.PersonMetrics m ON p.PersonId = m.PersonId
                LEFT JOIN cb.Entity po ON p.PrimaryOrganizationId = po.EntityId
                WHERE e.EntityType = 'person' AND e.IsDeleted = 0
                  AND (@Gender IS NULL OR p.Gender = @Gender)
                  AND (@PrimaryOrganizationId IS NULL OR p.PrimaryOrganizationId = @PrimaryOrganizationId)
                  AND (@MinFoundedOrgs IS NULL OR ISNULL(m.NumFoundedOrganizations, 0) >= @MinFoundedOrgs)
                  AND (@MaxFoundedOrgs IS NULL OR ISNULL(m.NumFoundedOrganizations, 0) <= @MaxFoundedOrgs)
                  AND (@MinInvestments IS NULL OR ISNULL(m.NumInvestments, 0) >= @MinInvestments)
                  AND (@MaxInvestments IS NULL OR ISNULL(m.NumInvestments, 0) <= @MaxInvestments)
                  AND (@IsInvestor IS NULL OR (@IsInvestor = 1 AND (ISNULL(m.NumInvestments, 0) > 0 OR ISNULL(m.NumPartnerInvestments, 0) > 0)))
                  AND (@HasEventAppearances IS NULL OR (@HasEventAppearances = 1 AND ISNULL(m.NumEventAppearances, 0) > 0))
                  AND (@SearchText IS NULL OR e.DisplayName LIKE @SearchText + '%')
            )
            SELECT 
                EntityId AS PersonId, EntityId, Uuid, DisplayName, Permalink, ImageUrl, Gender,
                PrimaryOrganizationId, PrimaryOrganizationName, PrimaryJobTitle,
                CASE WHEN City IS NOT NULL AND CountryCode IS NOT NULL THEN City + ', ' + CountryCode 
                     WHEN City IS NOT NULL THEN City 
                     WHEN CountryCode IS NOT NULL THEN CountryCode 
                     ELSE NULL 
                END AS Location,
                CAST(CASE WHEN NumInvestments > 0 OR NumPartnerInvestments > 0 THEN 1 ELSE 0 END AS BIT) AS IsInvestor,
                RankPerson, NumJobs, NumCurrentJobs, NumFoundedOrganizations,
                NumInvestments, NumPartnerInvestments, NumEventAppearances, NumArticles,
                (SELECT COUNT(*) FROM FilteredPeople) AS TotalCount
            FROM FilteredPeople
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum;";

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        
        var offset = (request.PageNumber - 1) * request.PageSize;
        var parameters = new
        {
            Offset = offset,
            PageSize = request.PageSize,
            SortColumn = request.SortColumn ?? "RankPerson",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.Gender,
            request.PrimaryOrganizationId,
            request.MinFoundedOrgs,
            request.MaxFoundedOrgs,
            request.MinInvestments,
            request.MaxInvestments,
            request.IsInvestor,
            request.HasEventAppearances,
            SearchText = request.SearchText
        };

        var results = await connection.QueryAsync<PersonListItemDto>(sql, parameters, commandTimeout: 60);
        var items = results.ToList();
        
        return new PagedResult<PersonListItemDto>
        {
            Items = items,
            TotalCount = items.FirstOrDefault()?.TotalCount ?? 0,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<PersonDetailDto?> GetByIdAsync(int entityId, CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        
        const string sql = @"
            SELECT 
                -- Core Identity
                e.EntityId, e.Uuid, e.Permalink,
                
                -- Name
                p.FirstName, p.MiddleName, p.LastName,
                e.DisplayName,
                ISNULL(p.FirstName, '') + 
                    CASE WHEN p.MiddleName IS NOT NULL THEN ' ' + p.MiddleName ELSE '' END + 
                    CASE WHEN p.LastName IS NOT NULL THEN ' ' + p.LastName ELSE '' END AS FullName,
                
                -- Profile
                e.ImageUrl,
                e.ShortDescription,
                e.Description,
                p.Gender,
                
                -- Location
                e.City AS LocationCity,
                e.Country AS LocationCountry,
                e.CountryCode AS LocationCountryCode,
                
                -- Primary Job
                p.PrimaryJobTitle,
                po.DisplayName AS PrimaryOrganizationName,
                p.PrimaryOrganizationId,
                po.Permalink AS PrimaryOrganizationPermalink,
                
                -- Job Metrics
                ISNULL(m.NumJobs, 0) AS NumJobs,
                ISNULL(m.NumCurrentJobs, 0) AS NumCurrentJobs,
                ISNULL(m.NumPastJobs, 0) AS NumPastJobs,
                ISNULL(m.NumCurrentAdvisorJobs, 0) AS NumCurrentAdvisorJobs,
                ISNULL(m.NumPastAdvisorJobs, 0) AS NumPastAdvisorJobs,
                ISNULL(m.NumFoundedOrganizations, 0) AS NumFoundedOrganizations,
                
                -- Investment Metrics
                ISNULL(m.NumInvestments, 0) AS NumInvestments,
                ISNULL(m.NumPortfolioOrganizations, 0) AS NumPortfolioOrganizations,
                ISNULL(m.NumPartnerInvestments, 0) AS NumPartnerInvestments,
                ISNULL(m.NumLeadInvestments, 0) AS NumLeadInvestments,
                ISNULL(m.NumInvestments, 0) - ISNULL(m.NumPartnerInvestments, 0) AS NumOwnInvestments,
                ISNULL(m.NumDiversitySpotlightInvestments, 0) AS NumDiversitySpotlightInvestments,
                
                -- Other Metrics
                ISNULL(m.NumEventAppearances, 0) AS NumEventAppearances,
                ISNULL(m.NumArticles, 0) AS NumArticles,
                ISNULL(m.NumExits, 0) AS NumExits,
                ISNULL(m.NumExitsIpo, 0) AS NumExitsIpo,
                
                -- Ranking
                ISNULL(m.RankPerson, 0) AS RankPerson,
                ISNULL(m.RankDeltaD7, 0) AS RankDeltaD7,
                ISNULL(m.RankDeltaD30, 0) AS RankDeltaD30,
                ISNULL(m.RankDeltaD90, 0) AS RankDeltaD90,
                
                -- Social & Contact
                e.WebsiteUrl,
                e.LinkedinUrl,
                e.TwitterUrl,
                e.FacebookUrl,
                
                -- Birth/Death
                p.BornOn,
                p.BornOnPrecision,
                p.DiedOn,
                p.DiedOnPrecision,
                
                -- Metadata
                e.CreatedAt,
                e.UpdatedAt,
                
                -- Aliases JSON
                e.AliasesJson,
                e.PermalinkAliasesJson
                
            FROM cb.Entity e
            INNER JOIN cb.Person p ON e.EntityId = p.PersonId
            LEFT JOIN cb.PersonMetrics m ON p.PersonId = m.PersonId
            LEFT JOIN cb.Entity po ON p.PrimaryOrganizationId = po.EntityId
            WHERE e.EntityId = @EntityId 
              AND e.EntityType = 'person' 
              AND e.IsDeleted = 0;";

        var person = await connection.QueryFirstOrDefaultAsync<PersonDetailDto>(sql, new { EntityId = entityId });
        if (person == null) return null;

        // Parse aliases from JSON
        if (!string.IsNullOrEmpty(person.AliasesJson))
        {
            try { person.Aliases = JsonSerializer.Deserialize<List<string>>(person.AliasesJson) ?? new(); }
            catch { person.Aliases = new(); }
        }
        if (!string.IsNullOrEmpty(person.PermalinkAliasesJson))
        {
            try { person.PermalinkAliases = JsonSerializer.Deserialize<List<string>>(person.PermalinkAliasesJson) ?? new(); }
            catch { person.PermalinkAliases = new(); }
        }

        // Load related data sequentially (MARS not enabled)
        person.Jobs = await GetJobsAsync(connection, entityId);
        person.Degrees = await GetDegreesAsync(connection, entityId);
        person.FoundedOrganizations = await GetFoundedOrganizationsAsync(connection, entityId);
        person.Investments = await GetInvestmentsAsync(connection, entityId);

        return person;
    }

    public async Task<PersonDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken cancellationToken = default)
    {
        const string sql = @"
            SELECT e.EntityId 
            FROM cb.Entity e 
            WHERE e.Permalink = @Permalink 
              AND e.EntityType = 'person'
              AND e.IsDeleted = 0;";

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        var entityId = await connection.QueryFirstOrDefaultAsync<int?>(sql, new { Permalink = permalink });
        
        return entityId.HasValue 
            ? await GetByIdAsync(entityId.Value, cancellationToken) 
            : null;
    }

    private async Task<List<JobDto>> GetJobsAsync(System.Data.IDbConnection connection, int personId)
    {
        const string sql = @"
            SELECT j.JobId, j.OrganizationId, e.DisplayName AS OrganizationName, 
                   e.Permalink AS OrganizationPermalink, j.Title, j.JobType,
                   j.StartedOn, j.StartedOnPrecision,
                   j.EndedOn, j.EndedOnPrecision,
                   j.IsCurrent, j.LocationText
            FROM cb.Job j
            LEFT JOIN cb.Entity e ON j.OrganizationId = e.EntityId
            WHERE j.PersonId = @PersonId
            ORDER BY j.IsCurrent DESC, j.StartedOn DESC;";
        
        return (await connection.QueryAsync<JobDto>(sql, new { PersonId = personId })).ToList();
    }

    private async Task<List<DegreeDto>> GetDegreesAsync(System.Data.IDbConnection connection, int personId)
    {
        const string sql = @"
            SELECT DegreeId, SchoolName, Subject, DegreeType, StartedOn, CompletedOn
            FROM cb.Degree
            WHERE PersonId = @PersonId
            ORDER BY CompletedOn DESC;";
        
        return (await connection.QueryAsync<DegreeDto>(sql, new { PersonId = personId })).ToList();
    }

    private async Task<List<FoundedOrgDto>> GetFoundedOrganizationsAsync(System.Data.IDbConnection connection, int personId)
    {
        const string sql = @"
            SELECT ofr.OrganizationId, e.DisplayName, e.Permalink, e.ImageUrl, ofr.Title, ofr.IsPrimary
            FROM cb.OrganizationFounder ofr
            INNER JOIN cb.Entity e ON ofr.OrganizationId = e.EntityId
            WHERE ofr.PersonId = @PersonId AND e.IsDeleted = 0
            ORDER BY ofr.IsPrimary DESC;";
        
        return (await connection.QueryAsync<FoundedOrgDto>(sql, new { PersonId = personId })).ToList();
    }

    private async Task<List<PersonInvestmentDto>> GetInvestmentsAsync(System.Data.IDbConnection connection, int personId)
    {
        const string sql = @"
            SELECT i.InvestmentId, i.AnnouncedOn, 
                   e.DisplayName AS FundedOrgName, e.Permalink AS FundedOrgPermalink, 
                   i.OrganizationId AS FundedOrgId,
                   fr.InvestmentType,
                   ISNULL(m.IsLeadInvestor, 0) AS IsLeadInvestor, 
                   m.AmountUsd
            FROM cb.Investment i
            LEFT JOIN cb.InvestmentMetrics m ON i.InvestmentId = m.InvestmentId
            LEFT JOIN cb.FundingRound fr ON i.FundingRoundId = fr.FundingRoundId
            INNER JOIN cb.Entity e ON i.OrganizationId = e.EntityId
            WHERE i.InvestorEntityId = @PersonId AND e.IsDeleted = 0
            ORDER BY i.AnnouncedOn DESC;";
        
        return (await connection.QueryAsync<PersonInvestmentDto>(sql, new { PersonId = personId })).ToList();
    }
}
