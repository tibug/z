using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IEventService
{
    Task<PagedResult<EventListItemDto>> SearchAsync(EventSearchRequest request, CancellationToken ct = default);
    Task<EventDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EventDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class EventService : IEventService
{
    private readonly IEventRepository _repository;

    public EventService(IEventRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<EventListItemDto>> SearchAsync(EventSearchRequest request, CancellationToken ct = default)
    {
        return _repository.SearchAsync(request, ct);
    }

    public Task<EventDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return _repository.GetByIdAsync(id, ct);
    }

    public Task<EventDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        return _repository.GetByPermalinkAsync(permalink, ct);
    }
}
