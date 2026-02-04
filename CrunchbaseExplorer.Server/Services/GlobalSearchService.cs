using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IGlobalSearchService
{
    Task<List<GlobalSearchResultDto>> SearchAsync(GlobalSearchRequest request, CancellationToken ct = default);
}

public class GlobalSearchService : IGlobalSearchService
{
    private readonly IGlobalSearchRepository _repository;

    public GlobalSearchService(IGlobalSearchRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<GlobalSearchResultDto>> SearchAsync(GlobalSearchRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.SearchText))
            return new List<GlobalSearchResultDto>();

        if (request.TopN < 1) request.TopN = 10;
        if (request.TopN > 100) request.TopN = 100;

        return await _repository.SearchAsync(request, ct);
    }
}
