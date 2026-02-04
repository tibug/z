using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IPersonService
{
    Task<PagedResult<PersonListItemDto>> SearchAsync(PersonSearchRequest request, CancellationToken ct = default);
    Task<PersonDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PersonDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class PersonService : IPersonService
{
    private readonly IPersonRepository _repository;

    public PersonService(IPersonRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<PersonListItemDto>> SearchAsync(PersonSearchRequest request, CancellationToken ct = default)
    {
        SanitizeRequest(request);
        return await _repository.SearchAsync(request, ct);
    }

    public async Task<PersonDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _repository.GetByIdAsync(id, ct);
    }

    public async Task<PersonDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        return await _repository.GetByPermalinkAsync(permalink, ct);
    }

    private static void SanitizeRequest(PersonSearchRequest request)
    {
        if (request.PageNumber < 1) request.PageNumber = 1;
        if (request.PageSize < 1) request.PageSize = 25;
        if (request.PageSize > 500) request.PageSize = 500;

        var validSortColumns = new[] { "RankPerson", "Name", "NumInvestments", "NumFoundedOrganizations" };
        if (!validSortColumns.Contains(request.SortColumn))
            request.SortColumn = "RankPerson";
    }
}
