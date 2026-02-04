using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IInvestmentRepository
{
    Task<PagedResult<InvestmentListItemDto>> SearchAsync(InvestmentSearchRequest request, CancellationToken ct = default);
    Task<InvestmentDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
}

public class InvestmentRepository : IInvestmentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public InvestmentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResult<InvestmentListItemDto>> SearchAsync(InvestmentSearchRequest request, CancellationToken ct = default)
    {
        // Use LEFT JOINs to show investments even with missing related data
        const string sql = @"
            WITH FilteredInvestments AS (
                SELECT 
                    i.InvestmentId, i.FundingRoundId, i.InvestorEntityId, 
                    ie.DisplayName AS InvestorName, ie.Permalink AS InvestorPermalink, ie.EntityType AS InvestorType,
                    i.OrganizationId AS FundedOrganizationId, 
                    fe.DisplayName AS FundedOrganizationName, fe.Permalink AS FundedOrganizationPermalink,
                    ISNULL(fr.InvestmentType, 'Unknown') + ' - ' + ISNULL(fe.DisplayName, 'Unknown') AS FundingRoundName,
                    i.AnnouncedOn, fr.MoneyRaisedUsd AS FundingRoundMoneyRaisedUsd,
                    ISNULL(m.IsLeadInvestor, 0) AS IsLeadInvestor, 
                    m.AmountUsd, 
                    ISNULL(m.PartnerCount, 0) AS PartnerCount,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'ASC' THEN i.AnnouncedOn END ASC,
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'DESC' THEN i.AnnouncedOn END DESC,
                            CASE WHEN @SortColumn = 'AmountUsd' AND @SortDirection = 'ASC' THEN ISNULL(m.AmountUsd, 0) END ASC,
                            CASE WHEN @SortColumn = 'AmountUsd' AND @SortDirection = 'DESC' THEN ISNULL(m.AmountUsd, 0) END DESC,
                            i.InvestmentId ASC
                    ) AS RowNum
                FROM cb.Investment i
                LEFT JOIN cb.InvestmentMetrics m ON i.InvestmentId = m.InvestmentId
                LEFT JOIN cb.Entity ie ON i.InvestorEntityId = ie.EntityId
                LEFT JOIN cb.Entity fe ON i.OrganizationId = fe.EntityId
                LEFT JOIN cb.FundingRound fr ON i.FundingRoundId = fr.FundingRoundId
                WHERE 1=1
                  AND (@InvestorEntityId IS NULL OR i.InvestorEntityId = @InvestorEntityId)
                  AND (@FundedOrganizationId IS NULL OR i.OrganizationId = @FundedOrganizationId)
                  AND (@FundingRoundId IS NULL OR i.FundingRoundId = @FundingRoundId)
                  AND (@FromDate IS NULL OR i.AnnouncedOn >= @FromDate)
                  AND (@ToDate IS NULL OR i.AnnouncedOn <= @ToDate)
                  AND (@MinAmount IS NULL OR ISNULL(m.AmountUsd, 0) >= @MinAmount)
                  AND (@MaxAmount IS NULL OR m.AmountUsd <= @MaxAmount)
            )
            SELECT 
                InvestmentId, FundingRoundId, InvestorEntityId, InvestorName, InvestorPermalink, InvestorType,
                FundedOrganizationId, FundedOrganizationName, FundedOrganizationName AS FundedOrgName,
                FundedOrganizationPermalink, FundingRoundName, AnnouncedOn, FundingRoundMoneyRaisedUsd,
                IsLeadInvestor, AmountUsd, AmountUsd AS Amount, PartnerCount,
                (SELECT COUNT(*) FROM FilteredInvestments) AS TotalCount
            FROM FilteredInvestments
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var results = await connection.QueryAsync<InvestmentListItemDto>(sql, new
        {
            Offset = (request.PageNumber - 1) * request.PageSize,
            request.PageSize,
            SortColumn = request.SortColumn ?? "AnnouncedOn",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.InvestorEntityId, request.FundedOrganizationId, request.FundingRoundId,
            request.FromDate, request.ToDate, request.MinAmount, request.MaxAmount
        }, commandTimeout: 60);

        var items = results.ToList();
        return new PagedResult<InvestmentListItemDto>
        {
            Items = items,
            TotalCount = items.FirstOrDefault()?.TotalCount ?? 0,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<InvestmentDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        
        // Use LEFT JOINs for better data availability
        const string sql = @"
            SELECT i.InvestmentId, i.FundingRoundId, i.AnnouncedOn, i.Role,
                   fr.InvestmentType AS FundingRoundInvestmentType, fr.MoneyRaisedUsd AS FundingRoundMoneyRaisedUsd,
                   i.InvestorEntityId, ie.DisplayName AS InvestorName, ie.Permalink AS InvestorPermalink,
                   i.OrganizationId AS FundedOrganizationId, fe.DisplayName AS FundedOrganizationName, 
                   fe.Permalink AS FundedOrganizationPermalink,
                   ISNULL(m.IsLeadInvestor, 0) AS IsLeadInvestor, 
                   m.AmountUsd, 
                   ISNULL(m.PartnerCount, 0) AS PartnerCount
            FROM cb.Investment i
            LEFT JOIN cb.InvestmentMetrics m ON i.InvestmentId = m.InvestmentId
            LEFT JOIN cb.Entity ie ON i.InvestorEntityId = ie.EntityId
            LEFT JOIN cb.Entity fe ON i.OrganizationId = fe.EntityId
            LEFT JOIN cb.FundingRound fr ON i.FundingRoundId = fr.FundingRoundId
            WHERE i.InvestmentId = @Id;";

        var investment = await connection.QueryFirstOrDefaultAsync<InvestmentDetailDto>(sql, new { Id = id });
        if (investment == null) return null;

        const string partnersSql = @"
            SELECT ip.InvestmentPartnerId, ip.PartnerEntityId, e.DisplayName AS PartnerName, 
                   e.Permalink AS PartnerPermalink, ip.Role
            FROM cb.InvestmentPartner ip
            INNER JOIN cb.Entity e ON ip.PartnerEntityId = e.EntityId
            WHERE ip.InvestmentId = @Id AND e.IsDeleted = 0;";

        investment.Partners = (await connection.QueryAsync<PartnerDto>(partnersSql, new { Id = id })).ToList();
        return investment;
    }
}
