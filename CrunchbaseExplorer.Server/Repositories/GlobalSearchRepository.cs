using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IGlobalSearchRepository
{
    Task<List<GlobalSearchResultDto>> SearchAsync(GlobalSearchRequest request, CancellationToken ct = default);
}

public class GlobalSearchRepository : IGlobalSearchRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public GlobalSearchRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<GlobalSearchResultDto>> SearchAsync(GlobalSearchRequest request, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT TOP (@TopN)
                e.EntityId, e.Uuid, e.EntityType, e.DisplayName, e.Permalink,
                e.ShortDescription, e.ImageUrl, e.CountryCode, e.City, e.Rank,
                CASE 
                    WHEN e.DisplayName LIKE @SearchPrefix THEN 1
                    WHEN e.DisplayName LIKE @SearchContains THEN 2
                    ELSE 3
                END AS MatchRank
            FROM cb.Entity e
            WHERE e.IsDeleted = 0
              AND (@EntityTypes IS NULL OR e.EntityType IN (SELECT value FROM STRING_SPLIT(@EntityTypes, ',')))
              AND (e.DisplayName LIKE @SearchContains 
                   OR e.Permalink LIKE @SearchContains 
                   OR e.IdentifierValue LIKE @SearchContains)
            ORDER BY MatchRank, e.Rank;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        
        var results = await connection.QueryAsync<GlobalSearchResultDto>(sql, new
        {
            request.TopN,
            request.EntityTypes,
            SearchPrefix = $"{request.SearchText}%",
            SearchContains = $"%{request.SearchText}%"
        });

        return results.ToList();
    }
}
