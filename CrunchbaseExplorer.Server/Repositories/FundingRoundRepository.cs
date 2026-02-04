using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;
using System.Data;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IFundingRoundRepository
{
    Task<PagedResult<FundingRoundListItemDto>> SearchAsync(FundingRoundSearchRequest request, CancellationToken ct = default);
    Task<FundingRoundDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<FundingRoundDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class FundingRoundRepository : IFundingRoundRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FundingRoundRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResult<FundingRoundListItemDto>> SearchAsync(FundingRoundSearchRequest request, CancellationToken ct = default)
    {
        const string sql = @"
            WITH FilteredRounds AS (
                SELECT 
                    fr.FundingRoundId, fr.AnnouncedOn, fr.InvestmentType, fr.InvestmentStage,
                    fr.IsEquity, fr.MoneyRaisedUsd, fr.FundingStage, fr.FundedOrganizationId,
                    e.Permalink,
                    fe.DisplayName AS FundedOrganizationName, fe.Permalink AS FundedOrganizationPermalink,
                    ISNULL(m.RankFundingRound, 999999) AS RankFundingRound, 
                    ISNULL(m.NumInvestors, 0) AS NumInvestors, 
                    ISNULL(m.NumLeadInvestors, 0) AS NumLeadInvestors, 
                    ISNULL(m.NumPartners, 0) AS NumPartners,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'RankFundingRound' AND @SortDirection = 'ASC' THEN ISNULL(m.RankFundingRound, 999999) END ASC,
                            CASE WHEN @SortColumn = 'RankFundingRound' AND @SortDirection = 'DESC' THEN ISNULL(m.RankFundingRound, 999999) END DESC,
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'ASC' THEN fr.AnnouncedOn END ASC,
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'DESC' THEN fr.AnnouncedOn END DESC,
                            CASE WHEN @SortColumn = 'MoneyRaisedUsd' AND @SortDirection = 'ASC' THEN ISNULL(fr.MoneyRaisedUsd, 0) END ASC,
                            CASE WHEN @SortColumn = 'MoneyRaisedUsd' AND @SortDirection = 'DESC' THEN ISNULL(fr.MoneyRaisedUsd, 0) END DESC,
                            fr.FundingRoundId ASC
                    ) AS RowNum
                FROM cb.FundingRound fr
                LEFT JOIN cb.Entity e ON fr.FundingRoundId = e.EntityId AND e.EntityType = 'funding_round'
                LEFT JOIN cb.FundingRoundMetrics m ON fr.FundingRoundId = m.FundingRoundId
                LEFT JOIN cb.Entity fe ON fr.FundedOrganizationId = fe.EntityId
                WHERE 1=1
                  AND (@FromDate IS NULL OR fr.AnnouncedOn >= @FromDate)
                  AND (@ToDate IS NULL OR fr.AnnouncedOn <= @ToDate)
                  AND (@InvestmentType IS NULL OR fr.InvestmentType = @InvestmentType)
                  AND (@InvestmentStage IS NULL OR fr.InvestmentStage = @InvestmentStage)
                  AND (@IsEquity IS NULL OR fr.IsEquity = @IsEquity)
                  AND (@FundingStage IS NULL OR fr.FundingStage = @FundingStage)
                  AND (@FundedOrganizationId IS NULL OR fr.FundedOrganizationId = @FundedOrganizationId)
                  AND (@MinMoneyRaised IS NULL OR ISNULL(fr.MoneyRaisedUsd, 0) >= @MinMoneyRaised)
                  AND (@MaxMoneyRaised IS NULL OR fr.MoneyRaisedUsd <= @MaxMoneyRaised)
            )
            SELECT 
                FundingRoundId,
                Permalink,
                ISNULL(InvestmentType, 'Unknown') + ' - ' + ISNULL(FundedOrganizationName, 'Unknown') AS RoundName,
                AnnouncedOn, InvestmentType, InvestmentStage, FundingStage, IsEquity, MoneyRaisedUsd,
                FundedOrganizationId, FundedOrganizationName, 
                FundedOrganizationName AS OrganizationName, 
                FundedOrganizationPermalink,
                FundedOrganizationPermalink AS OrganizationPermalink,
                RankFundingRound, NumInvestors, NumLeadInvestors, NumPartners,
                (SELECT COUNT(*) FROM FilteredRounds) AS TotalCount
            FROM FilteredRounds
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var results = await connection.QueryAsync<FundingRoundListItemDto>(sql, new
        {
            Offset = (request.PageNumber - 1) * request.PageSize,
            request.PageSize,
            SortColumn = request.SortColumn ?? "AnnouncedOn",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.FromDate, request.ToDate, request.InvestmentType, request.InvestmentStage,
            request.IsEquity, request.FundingStage, request.FundedOrganizationId,
            request.MinMoneyRaised, request.MaxMoneyRaised
        }, commandTimeout: 60);

        var items = results.ToList();
        return new PagedResult<FundingRoundListItemDto>
        {
            Items = items,
            TotalCount = items.FirstOrDefault()?.TotalCount ?? 0,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<FundingRoundDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        
        const string sql = @"
            SELECT 
                -- Core Identity
                fr.FundingRoundId,
                ISNULL(fr.InvestmentType, 'Funding Round') + ' - ' + ISNULL(fe.DisplayName, 'Unknown') AS RoundName,
                e.Permalink,
                
                -- Description
                e.ShortDescription,
                fr.FundedOrgDescription AS Description,
                e.ImageUrl,
                
                -- Funded Organization
                fr.FundedOrganizationId,
                fe.DisplayName AS FundedOrganizationName,
                fe.Permalink AS FundedOrganizationPermalink,
                fr.FundingStage AS FundedOrganizationStage,
                fr.FundedOrgFundingTotalUsd AS FundedOrganizationFundingTotalUsd,
                fr.FundedOrgRevenueRange AS FundedOrganizationRevenueRange,
                fe.ImageUrl AS FundedOrganizationImageUrl,
                
                -- Round Details
                fr.InvestmentType,
                fr.InvestmentStage,
                fr.FundingStage,
                fr.IsEquity,
                
                -- Dates
                fr.AnnouncedOn,
                fr.ClosedOn,
                
                -- Money
                fr.MoneyRaisedUsd,
                fr.TargetMoneyRaisedUsd,
                fr.PreMoneyValuationUsd,
                fr.PostMoneyValuationUsd,
                
                -- Metrics
                ISNULL(m.RankFundingRound, 0) AS RankFundingRound,
                ISNULL(m.RankFundingRound, 0) AS Rank,
                ISNULL(m.NumInvestors, 0) AS NumInvestors,
                ISNULL(m.NumLeadInvestors, 0) AS NumLeadInvestors,
                ISNULL(m.NumPartners, 0) AS NumPartners,
                
                -- Metadata
                e.CreatedAt,
                e.UpdatedAt
                
            FROM cb.FundingRound fr
            LEFT JOIN cb.Entity e ON fr.FundingRoundId = e.EntityId AND e.EntityType = 'funding_round'
            LEFT JOIN cb.FundingRoundMetrics m ON fr.FundingRoundId = m.FundingRoundId
            LEFT JOIN cb.Entity fe ON fr.FundedOrganizationId = fe.EntityId
            WHERE fr.FundingRoundId = @Id;";

        var round = await connection.QueryFirstOrDefaultAsync<FundingRoundDetailDto>(sql, new { Id = id });
        if (round == null) return null;

        // Load related data sequentially (MARS not enabled)
        round.Investors = await GetInvestorsAsync(connection, id);
        round.Categories = await GetCategoriesAsync(connection, id);
        round.CategoryGroups = await GetCategoryGroupsAsync(connection, id);
        round.PressReferences = await GetPressReferencesAsync(connection, id);

        return round;
    }

    public async Task<FundingRoundDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT e.EntityId 
            FROM cb.Entity e 
            WHERE e.Permalink = @Permalink 
              AND e.EntityType = 'funding_round'
              AND e.IsDeleted = 0;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var entityId = await connection.QueryFirstOrDefaultAsync<int?>(sql, new { Permalink = permalink });
        
        if (entityId == null) return null;
        return await GetByIdAsync(entityId.Value, ct);
    }

    private async Task<List<InvestorDto>> GetInvestorsAsync(IDbConnection connection, int fundingRoundId)
    {
        const string sql = @"
            SELECT 
                fri.FundingRoundInvestorId,
                fri.InvestorEntityId,
                e.DisplayName AS InvestorName,
                e.Permalink AS InvestorPermalink,
                e.EntityType AS InvestorType,
                e.ImageUrl AS InvestorImageUrl,
                fri.IsLeadInvestor,
                fri.AmountUsd,
                fri.Role
            FROM cb.FundingRoundInvestor fri
            INNER JOIN cb.Entity e ON fri.InvestorEntityId = e.EntityId
            WHERE fri.FundingRoundId = @FundingRoundId 
              AND e.IsDeleted = 0
            ORDER BY fri.IsLeadInvestor DESC, e.DisplayName;";

        var results = await connection.QueryAsync<InvestorDto>(sql, new { FundingRoundId = fundingRoundId });
        return results.ToList();
    }

    private async Task<List<CategoryDto>> GetCategoriesAsync(IDbConnection connection, int fundingRoundId)
    {
        const string sql = @"
            SELECT 
                c.CategoryUuid,
                c.Name,
                c.Permalink,
                ec.IsPrimary
            FROM cb.EntityCategory ec
            INNER JOIN cb.Category c ON ec.CategoryUuid = c.CategoryUuid
            WHERE ec.EntityId = @EntityId
            ORDER BY ec.IsPrimary DESC, c.Name;";

        var results = await connection.QueryAsync<CategoryDto>(sql, new { EntityId = fundingRoundId });
        return results.ToList();
    }

    private async Task<List<CategoryGroupDto>> GetCategoryGroupsAsync(IDbConnection connection, int fundingRoundId)
    {
        const string sql = @"
            SELECT DISTINCT
                cg.CategoryGroupUuid,
                cg.Name,
                cg.Permalink,
                CAST(0 AS BIT) AS IsPrimary
            FROM cb.EntityCategory ec
            INNER JOIN cb.Category c ON ec.CategoryUuid = c.CategoryUuid
            INNER JOIN cb.CategoryGroup cg ON c.CategoryGroupUuid = cg.CategoryGroupUuid
            WHERE ec.EntityId = @EntityId
            ORDER BY cg.Name;";

        var results = await connection.QueryAsync<CategoryGroupDto>(sql, new { EntityId = fundingRoundId });
        return results.ToList();
    }

    private async Task<List<PressReferenceDto>> GetPressReferencesAsync(IDbConnection connection, int fundingRoundId)
    {
        const string sql = @"
            SELECT TOP 10
                pr.PressReferenceId,
                pr.Title,
                pr.Publisher,
                pr.Author,
                pr.PublishedOn,
                pr.Url
            FROM cb.PressReference pr
            WHERE pr.EntityId = @EntityId
            ORDER BY pr.PublishedOn DESC;";

        var results = await connection.QueryAsync<PressReferenceDto>(sql, new { EntityId = fundingRoundId });
        return results.ToList();
    }
}
