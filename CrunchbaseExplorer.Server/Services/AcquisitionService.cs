using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IAcquisitionService
{
    Task<PagedResult<AcquisitionListItemDto>> SearchAsync(AcquisitionSearchRequest request, CancellationToken ct = default);
    Task<AcquisitionDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
}

public class AcquisitionService : IAcquisitionService
{
    private readonly IAcquisitionRepository _repository;

    public AcquisitionService(IAcquisitionRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<AcquisitionListItemDto>> SearchAsync(AcquisitionSearchRequest request, CancellationToken ct = default)
    {
        return _repository.SearchAsync(request, ct);
    }

    public Task<AcquisitionDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _repository.GetByIdAsync(id, ct);
    }
}
