using CrunchbaseExplorer.Server.Repositories;
using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Services;

public interface IOrganizationService
{
    Task<PagedResult<OrganizationListItemDto>> SearchAsync(OrganizationSearchRequest request, CancellationToken ct = default);
    Task<OrganizationDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<OrganizationDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class OrganizationService : IOrganizationService
{
    private readonly IOrganizationRepository _repository;
    private readonly ILogger<OrganizationService> _logger;

    public OrganizationService(IOrganizationRepository repository, ILogger<OrganizationService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<PagedResult<OrganizationListItemDto>> SearchAsync(
        OrganizationSearchRequest request, 
        CancellationToken ct = default)
    {
        // Validate and sanitize request
        if (request.PageNumber < 1) request.PageNumber = 1;
        if (request.PageSize < 1) request.PageSize = 25;
        if (request.PageSize > 500) request.PageSize = 500;

        var validSortColumns = new[] { "Rank", "Name", "FundingTotal", "LastFundingAt" };
        if (!validSortColumns.Contains(request.SortColumn))
            request.SortColumn = "Rank";

        _logger.LogInformation("Searching organizations with filters: CompanyType={CompanyType}, Country={CountryCode}",
            request.CompanyType, request.CountryCode);

        return await _repository.SearchAsync(request, ct);
    }

    public async Task<OrganizationDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching organization detail for ID {EntityId}", id);
        return await _repository.GetByIdAsync(id, ct);
    }

    public async Task<OrganizationDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching organization detail for permalink {Permalink}", permalink);
        return await _repository.GetByPermalinkAsync(permalink, ct);
    }
}
