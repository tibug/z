using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IFundingRoundService
{
    Task<PagedResult<FundingRoundListItemDto>> SearchAsync(FundingRoundSearchRequest request, CancellationToken ct = default);
    Task<FundingRoundDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<FundingRoundDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class FundingRoundService : IFundingRoundService
{
    private readonly IFundingRoundRepository _repository;

    public FundingRoundService(IFundingRoundRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<FundingRoundListItemDto>> SearchAsync(FundingRoundSearchRequest request, CancellationToken ct = default)
    {
        return _repository.SearchAsync(request, ct);
    }

    public Task<FundingRoundDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _repository.GetByIdAsync(id, ct);
    }

    public Task<FundingRoundDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        return _repository.GetByPermalinkAsync(permalink, ct);
    }
}
