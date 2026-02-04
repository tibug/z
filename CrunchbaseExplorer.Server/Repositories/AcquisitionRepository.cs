using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IAcquisitionRepository
{
    Task<PagedResult<AcquisitionListItemDto>> SearchAsync(AcquisitionSearchRequest request, CancellationToken ct = default);
    Task<AcquisitionDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
}

public class AcquisitionRepository : IAcquisitionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AcquisitionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResult<AcquisitionListItemDto>> SearchAsync(AcquisitionSearchRequest request, CancellationToken ct = default)
    {
        // Using LEFT JOINs to include acquisitions even if entity data is partially missing
        const string sql = @"
            WITH FilteredAcquisitions AS (
                SELECT 
                    a.AcquisitionId, 
                    a.AcquirerOrganizationId, 
                    ae.DisplayName AS AcquirerName, ae.Permalink AS AcquirerPermalink,
                    a.AcquireeOrganizationId, 
                    acq.DisplayName AS AcquireeName, acq.Permalink AS AcquireePermalink,
                    a.AnnouncedOn, a.CompletedOn, a.PriceUsd, 
                    a.AcquisitionStatus, a.AcquisitionStatus AS Status, a.AcquisitionType,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'ASC' THEN a.AnnouncedOn END ASC,
                            CASE WHEN @SortColumn = 'AnnouncedOn' AND @SortDirection = 'DESC' THEN a.AnnouncedOn END DESC,
                            CASE WHEN @SortColumn = 'PriceUsd' AND @SortDirection = 'ASC' THEN a.PriceUsd END ASC,
                            CASE WHEN @SortColumn = 'PriceUsd' AND @SortDirection = 'DESC' THEN a.PriceUsd END DESC,
                            a.AcquisitionId ASC
                    ) AS RowNum
                FROM cb.Acquisition a
                LEFT JOIN cb.Entity ae ON a.AcquirerOrganizationId = ae.EntityId
                LEFT JOIN cb.Entity acq ON a.AcquireeOrganizationId = acq.EntityId
                WHERE 1=1
                  AND (@FromDate IS NULL OR a.AnnouncedOn >= @FromDate)
                  AND (@ToDate IS NULL OR a.AnnouncedOn <= @ToDate)
                  AND (@AcquirerOrganizationId IS NULL OR a.AcquirerOrganizationId = @AcquirerOrganizationId)
                  AND (@AcquireeOrganizationId IS NULL OR a.AcquireeOrganizationId = @AcquireeOrganizationId)
                  AND (@MinPrice IS NULL OR a.PriceUsd >= @MinPrice)
                  AND (@MaxPrice IS NULL OR a.PriceUsd <= @MaxPrice)
                  AND (@AcquisitionStatus IS NULL OR a.AcquisitionStatus = @AcquisitionStatus)
                  AND (@AcquisitionType IS NULL OR a.AcquisitionType = @AcquisitionType)
            )
            SELECT 
                AcquisitionId, AcquirerOrganizationId, AcquirerName, AcquirerPermalink,
                AcquireeOrganizationId, AcquireeName, AcquireePermalink,
                AnnouncedOn, CompletedOn, PriceUsd, PriceUsd AS Price,
                AcquisitionStatus, Status, AcquisitionType,
                (SELECT COUNT(*) FROM FilteredAcquisitions) AS TotalCount
            FROM FilteredAcquisitions
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var results = await connection.QueryAsync<AcquisitionListItemDto>(sql, new
        {
            Offset = (request.PageNumber - 1) * request.PageSize,
            request.PageSize,
            SortColumn = request.SortColumn ?? "AnnouncedOn",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.FromDate, request.ToDate, request.AcquirerOrganizationId, request.AcquireeOrganizationId,
            request.MinPrice, request.MaxPrice, request.AcquisitionStatus, request.AcquisitionType
        }, commandTimeout: 60);

        var items = results.ToList();
        return new PagedResult<AcquisitionListItemDto>
        {
            Items = items,
            TotalCount = items.FirstOrDefault()?.TotalCount ?? 0,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<AcquisitionDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        
        // Fixed: Use correct column name PriceCurrency (not PriceCurrencyCode)
        const string sql = @"
            SELECT a.AcquisitionId, a.AnnouncedOn, a.CompletedOn, a.AcquisitionType,
                   a.PriceUsd, a.PriceCurrency AS PriceCurrency, a.PaymentType, a.AcquisitionStatus,
                   a.TermsJson,
                   a.AcquirerOrganizationId, ae.DisplayName AS AcquirerName, ae.Permalink AS AcquirerPermalink,
                   a.AcquireeOrganizationId, acq.DisplayName AS AcquireeName, acq.Permalink AS AcquireePermalink
            FROM cb.Acquisition a
            LEFT JOIN cb.Entity ae ON a.AcquirerOrganizationId = ae.EntityId
            LEFT JOIN cb.Entity acq ON a.AcquireeOrganizationId = acq.EntityId
            WHERE a.AcquisitionId = @Id;";

        return await connection.QueryFirstOrDefaultAsync<AcquisitionDetailDto>(sql, new { Id = id });
    }
}
