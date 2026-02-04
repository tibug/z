using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;
using System.Text.Json;

namespace CrunchbaseExplorer.Server.Repositories;

public class OrganizationRepository : IOrganizationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<OrganizationRepository> _logger;

    public OrganizationRepository(
        IDbConnectionFactory connectionFactory,
        ILogger<OrganizationRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<PagedResult<OrganizationListItemDto>> SearchAsync(
        OrganizationSearchRequest request, 
        CancellationToken cancellationToken = default)
    {
        const string sql = @"
            WITH FilteredOrgs AS (
                SELECT 
                    e.EntityId,
                    e.Uuid,
                    e.DisplayName,
                    e.Permalink,
                    e.CountryCode,
                    e.City,
                    e.ImageUrl,
                    ISNULL(e.NumArticles, 0) AS NumArticles,
                    o.CompanyType,
                    o.OperatingStatus,
                    o.IpoStatus,
                    o.RevenueRangeCode,
                    o.NumEmployeesEnum,
                    o.FundingStage,
                    o.FundingTotalUsd,
                    o.LastFundingAt,
                    o.LastFundingType,
                    ISNULL(m.Rank, 999999) AS Rank,
                    ISNULL(m.NumFundingRounds, 0) AS NumFundingRounds,
                    ISNULL(m.NumInvestments, 0) AS NumInvestments,
                    ISNULL(m.NumLeadInvestments, 0) AS NumLeadInvestments,
                    ISNULL(m.NumAcquisitions, 0) AS NumAcquisitions,
                    ISNULL(m.NumExits, 0) AS NumExits,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'Rank' AND @SortDirection = 'ASC' THEN ISNULL(m.Rank, 999999) END ASC,
                            CASE WHEN @SortColumn = 'Rank' AND @SortDirection = 'DESC' THEN ISNULL(m.Rank, 999999) END DESC,
                            CASE WHEN @SortColumn = 'Name' AND @SortDirection = 'ASC' THEN e.DisplayName END ASC,
                            CASE WHEN @SortColumn = 'Name' AND @SortDirection = 'DESC' THEN e.DisplayName END DESC,
                            CASE WHEN @SortColumn = 'FundingTotal' AND @SortDirection = 'ASC' THEN ISNULL(o.FundingTotalUsd, 0) END ASC,
                            CASE WHEN @SortColumn = 'FundingTotal' AND @SortDirection = 'DESC' THEN ISNULL(o.FundingTotalUsd, 0) END DESC,
                            e.EntityId ASC
                    ) AS RowNum
                FROM cb.Entity e
                INNER JOIN cb.Organization o ON e.EntityId = o.OrganizationId
                LEFT JOIN cb.OrganizationMetrics m ON o.OrganizationId = m.OrganizationId
                WHERE e.EntityType = 'organization'
                  AND e.IsDeleted = 0
                  AND (@CompanyType IS NULL OR o.CompanyType = @CompanyType)
                  AND (@OperatingStatus IS NULL OR o.OperatingStatus = @OperatingStatus)
                  AND (@IpoStatus IS NULL OR o.IpoStatus = @IpoStatus)
                  AND (@CountryCode IS NULL OR e.CountryCode = @CountryCode)
                  AND (@City IS NULL OR e.City LIKE @City + '%')
                  AND (@RevenueRangeCode IS NULL OR o.RevenueRangeCode = @RevenueRangeCode)
                  AND (@NumEmployeesEnum IS NULL OR o.NumEmployeesEnum = @NumEmployeesEnum)
                  AND (@FundingStage IS NULL OR o.FundingStage = @FundingStage)
                  AND (@MinFundingTotalUsd IS NULL OR ISNULL(o.FundingTotalUsd, 0) >= @MinFundingTotalUsd)
                  AND (@MaxFundingTotalUsd IS NULL OR o.FundingTotalUsd <= @MaxFundingTotalUsd)
                  AND (@SearchText IS NULL OR e.DisplayName LIKE @SearchText + '%')
            )
            SELECT 
                EntityId AS OrganizationId, EntityId, Uuid, DisplayName, Permalink, 
                CountryCode, City, 
                CASE 
                    WHEN City IS NOT NULL AND CountryCode IS NOT NULL THEN City + ', ' + CountryCode
                    WHEN City IS NOT NULL THEN City
                    WHEN CountryCode IS NOT NULL THEN CountryCode
                    ELSE NULL
                END AS Location,
                ImageUrl,
                CompanyType, OperatingStatus, IpoStatus, RevenueRangeCode, NumEmployeesEnum,
                FundingStage, FundingTotalUsd, LastFundingAt, LastFundingType,
                Rank, NumFundingRounds, NumInvestments, NumLeadInvestments, 
                NumAcquisitions, NumExits, NumArticles,
                (SELECT COUNT(*) FROM FilteredOrgs) AS TotalCount
            FROM FilteredOrgs
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum;";

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        
        var offset = (request.PageNumber - 1) * request.PageSize;
        var parameters = new
        {
            Offset = offset,
            PageSize = request.PageSize,
            SortColumn = request.SortColumn ?? "Rank",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.CompanyType,
            request.OperatingStatus,
            request.IpoStatus,
            request.CountryCode,
            request.City,
            request.RevenueRangeCode,
            request.NumEmployeesEnum,
            request.FundingStage,
            request.MinFundingTotalUsd,
            request.MaxFundingTotalUsd,
            SearchText = request.SearchText
        };

        var results = await connection.QueryAsync<OrganizationListItemDto>(
            sql, 
            parameters,
            commandTimeout: 60);

        var items = results.ToList();
        var totalCount = items.FirstOrDefault()?.TotalCount ?? 0;

        return new PagedResult<OrganizationListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<OrganizationDetailDto?> GetByIdAsync(
        int entityId, 
        CancellationToken cancellationToken = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        
        const string orgSql = @"
            SELECT 
                -- Core Identity
                e.EntityId, e.Uuid, e.DisplayName, e.Permalink,
                e.DisplayName AS LegalName,
                
                -- Description
                e.ShortDescription, e.Description, e.ImageUrl,
                
                -- Location (from Entity and Organization)
                e.City AS HeadquartersCity,
                e.Region AS HeadquartersRegion,
                e.Country AS HeadquartersCountry,
                e.CountryCode AS HeadquartersCountryCode,
                o.HeadquartersText,
                
                -- Company Profile
                o.CompanyType, o.OperatingStatus, o.IpoStatus,
                o.FoundedOn, o.ClosedOn,
                
                -- Funding
                o.FundingStage,
                o.FundingTotalUsd AS TotalFundingUsd,
                o.LastFundingType,
                o.LastFundingAt AS LastFundingDate,
                
                -- Size
                o.RevenueRangeCode AS RevenueRange,
                o.NumEmployeesEnum AS EmployeeCountRange,
                CASE 
                    WHEN m.NumEmployeesMin IS NOT NULL AND m.NumEmployeesMax IS NOT NULL 
                    THEN (m.NumEmployeesMin + m.NumEmployeesMax) / 2
                    WHEN m.NumEmployeesMin IS NOT NULL THEN m.NumEmployeesMin
                    WHEN m.NumEmployeesMax IS NOT NULL THEN m.NumEmployeesMax
                    ELSE NULL
                END AS EmployeeCountExact,
                m.NumEmployeesMin,
                m.NumEmployeesMax,
                
                -- Ranking
                ISNULL(m.Rank, 0) AS Rank,
                ISNULL(m.RankDeltaD7, 0) AS RankDeltaD7,
                ISNULL(m.RankDeltaD30, 0) AS RankDeltaD30,
                ISNULL(m.RankDeltaD90, 0) AS RankDeltaD90,
                
                -- Metrics
                ISNULL(e.NumArticles, 0) AS NumArticles,
                ISNULL(m.NumFundingRounds, 0) AS NumFundingRounds,
                ISNULL(m.NumInvestments, 0) AS NumInvestments,
                ISNULL(m.NumLeadInvestments, 0) AS NumLeadInvestments,
                ISNULL(m.NumAcquisitions, 0) AS NumAcquisitions,
                ISNULL(m.NumExits, 0) AS NumExits,
                
                -- Contact Info
                e.WebsiteUrl,
                o.HomepageUrl,
                o.ContactEmail,
                o.PhoneNumber,
                
                -- Social Media
                e.LinkedinUrl,
                e.TwitterUrl,
                e.FacebookUrl,
                
                -- Stock
                o.StockSymbol,
                o.StockExchangeSymbol,
                
                -- Metadata
                e.CreatedAt,
                e.UpdatedAt,
                
                -- Aliases JSON
                e.AliasesJson,
                e.PermalinkAliasesJson
                
            FROM cb.Entity e
            INNER JOIN cb.Organization o ON e.EntityId = o.OrganizationId
            LEFT JOIN cb.OrganizationMetrics m ON o.OrganizationId = m.OrganizationId
            WHERE e.EntityId = @EntityId
              AND e.EntityType = 'organization'
              AND e.IsDeleted = 0;";

        var org = await connection.QueryFirstOrDefaultAsync<OrganizationDetailDto>(
            orgSql, 
            new { EntityId = entityId });

        if (org == null) return null;

        // Parse aliases from JSON
        if (!string.IsNullOrEmpty(org.AliasesJson))
        {
            try { org.Aliases = JsonSerializer.Deserialize<List<string>>(org.AliasesJson) ?? new(); }
            catch { org.Aliases = new(); }
        }
        if (!string.IsNullOrEmpty(org.PermalinkAliasesJson))
        {
            try { org.PermalinkAliases = JsonSerializer.Deserialize<List<string>>(org.PermalinkAliasesJson) ?? new(); }
            catch { org.PermalinkAliases = new(); }
        }

        // Load related data sequentially (MARS not enabled)
        org.Categories = await GetCategoriesAsync(connection, entityId);
        org.CategoryGroups = await GetCategoryGroupsAsync(connection, entityId);
        org.Locations = await GetLocationsAsync(connection, entityId);
        org.Founders = await GetFoundersAsync(connection, entityId);
        org.FundingRounds = await GetFundingRoundsAsync(connection, entityId);
        org.InvestmentsMade = await GetInvestmentsAsync(connection, entityId);
        var allAcquisitions = await GetAcquisitionsAsync(connection, entityId);
        org.AcquisitionsMade = allAcquisitions.Where(a => a.IsAcquirer).ToList();
        org.WasAcquiredIn = allAcquisitions.Where(a => !a.IsAcquirer).ToList();
        org.StockListings = await GetStockListingsAsync(connection, entityId);

        return org;
    }

    public async Task<OrganizationDetailDto?> GetByPermalinkAsync(
        string permalink, 
        CancellationToken cancellationToken = default)
    {
        const string sql = @"
            SELECT e.EntityId 
            FROM cb.Entity e 
            WHERE e.Permalink = @Permalink 
              AND e.EntityType = 'organization'
              AND e.IsDeleted = 0;";

        using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);
        var entityId = await connection.QueryFirstOrDefaultAsync<int?>(sql, new { Permalink = permalink });
        
        return entityId.HasValue 
            ? await GetByIdAsync(entityId.Value, cancellationToken) 
            : null;
    }

    private async Task<List<CategoryDto>> GetCategoriesAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT c.CategoryUuid, c.Name, c.Permalink, ec.IsPrimary
            FROM cb.EntityCategory ec
            INNER JOIN cb.Category c ON ec.CategoryUuid = c.CategoryUuid
            WHERE ec.EntityId = @EntityId
            ORDER BY ec.IsPrimary DESC, c.Name;";
        
        return (await connection.QueryAsync<CategoryDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<CategoryGroupDto>> GetCategoryGroupsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT cg.CategoryGroupUuid, cg.Name, cg.Permalink, ecg.IsPrimary
            FROM cb.EntityCategoryGroup ecg
            INNER JOIN cb.CategoryGroup cg ON ecg.CategoryGroupUuid = cg.CategoryGroupUuid
            WHERE ecg.EntityId = @EntityId
            ORDER BY ecg.IsPrimary DESC, cg.Name;";
        
        return (await connection.QueryAsync<CategoryGroupDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<LocationDto>> GetLocationsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT l.LocationUuid, l.Name, l.Permalink, l.LocationType, el.IsPrimary
            FROM cb.EntityLocation el
            INNER JOIN cb.Location l ON el.LocationUuid = l.LocationUuid
            WHERE el.EntityId = @EntityId;";
        
        return (await connection.QueryAsync<LocationDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<FounderDto>> GetFoundersAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT p.PersonId, e.DisplayName, e.Permalink, e.ImageUrl, 
                   ofr.Title, ofr.IsPrimary
            FROM cb.OrganizationFounder ofr
            INNER JOIN cb.Person p ON ofr.PersonId = p.PersonId
            INNER JOIN cb.Entity e ON p.PersonId = e.EntityId
            WHERE ofr.OrganizationId = @EntityId AND e.IsDeleted = 0
            ORDER BY ofr.IsPrimary DESC;";
        
        return (await connection.QueryAsync<FounderDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<FundingRoundSummaryDto>> GetFundingRoundsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT fr.FundingRoundId, fr.AnnouncedOn, fr.InvestmentType, 
                   fr.FundingStage, fr.MoneyRaisedUsd, ISNULL(m.NumInvestors, 0) AS NumInvestors
            FROM cb.FundingRound fr
            LEFT JOIN cb.FundingRoundMetrics m ON fr.FundingRoundId = m.FundingRoundId
            WHERE fr.FundedOrganizationId = @EntityId
            ORDER BY fr.AnnouncedOn DESC;";
        
        return (await connection.QueryAsync<FundingRoundSummaryDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<InvestmentSummaryDto>> GetInvestmentsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT i.InvestmentId, i.AnnouncedOn, e.DisplayName AS FundedOrgName,
                   e.Permalink AS FundedOrgPermalink, i.OrganizationId AS FundedOrgId,
                   ISNULL(m.IsLeadInvestor, 0) AS IsLeadInvestor, m.AmountUsd
            FROM cb.Investment i
            LEFT JOIN cb.InvestmentMetrics m ON i.InvestmentId = m.InvestmentId
            INNER JOIN cb.Entity e ON i.OrganizationId = e.EntityId
            WHERE i.InvestorEntityId = @EntityId AND e.IsDeleted = 0
            ORDER BY i.AnnouncedOn DESC;";
        
        return (await connection.QueryAsync<InvestmentSummaryDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<AcquisitionSummaryDto>> GetAcquisitionsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT 
                a.AcquisitionId, a.AnnouncedOn, a.PriceUsd, a.AcquisitionStatus,
                CASE WHEN a.AcquirerOrganizationId = @EntityId THEN 1 ELSE 0 END AS IsAcquirer,
                CASE WHEN a.AcquirerOrganizationId = @EntityId THEN ae.DisplayName ELSE acq.DisplayName END AS OtherOrgName,
                CASE WHEN a.AcquirerOrganizationId = @EntityId THEN ae.Permalink ELSE acq.Permalink END AS OtherOrgPermalink,
                CASE WHEN a.AcquirerOrganizationId = @EntityId THEN a.AcquireeOrganizationId ELSE a.AcquirerOrganizationId END AS OtherOrgId
            FROM cb.Acquisition a
            LEFT JOIN cb.Entity ae ON a.AcquireeOrganizationId = ae.EntityId
            LEFT JOIN cb.Entity acq ON a.AcquirerOrganizationId = acq.EntityId
            WHERE a.AcquirerOrganizationId = @EntityId OR a.AcquireeOrganizationId = @EntityId
            ORDER BY a.AnnouncedOn DESC;";
        
        return (await connection.QueryAsync<AcquisitionSummaryDto>(sql, new { EntityId = entityId })).ToList();
    }

    private async Task<List<StockListingDto>> GetStockListingsAsync(System.Data.IDbConnection connection, int entityId)
    {
        const string sql = @"
            SELECT sl.StockListingId, sl.Ticker, sl.WentPublicOn, sl.IsActive,
                   e.ExchangeSymbol, e.ExchangeName
            FROM cb.StockListing sl
            INNER JOIN cb.Exchange e ON sl.ExchangeId = e.ExchangeId
            WHERE sl.OrganizationId = @EntityId;";
        
        return (await connection.QueryAsync<StockListingDto>(sql, new { EntityId = entityId })).ToList();
    }
}
