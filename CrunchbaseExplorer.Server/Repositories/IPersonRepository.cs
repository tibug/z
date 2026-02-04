using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IPersonRepository
{
    Task<PagedResult<PersonListItemDto>> SearchAsync(PersonSearchRequest request, CancellationToken ct = default);
    Task<PersonDetailDto?> GetByIdAsync(int entityId, CancellationToken ct = default);
    Task<PersonDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}
