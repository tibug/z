using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IInvestmentService
{
    Task<PagedResult<InvestmentListItemDto>> SearchAsync(InvestmentSearchRequest request, CancellationToken ct = default);
    Task<InvestmentDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
}

public class InvestmentService : IInvestmentService
{
    private readonly IInvestmentRepository _repository;

    public InvestmentService(IInvestmentRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<InvestmentListItemDto>> SearchAsync(InvestmentSearchRequest request, CancellationToken ct = default)
    {
        return _repository.SearchAsync(request, ct);
    }

    public Task<InvestmentDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _repository.GetByIdAsync(id, ct);
    }
}
