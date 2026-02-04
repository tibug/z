using CrunchbaseExplorer.Shared.DTOs;

namespace CrunchbaseExplorer.Server.Repositories;

/// <summary>
/// Repository for organization data access
/// </summary>
public interface IOrganizationRepository
{
    Task<PagedResult<OrganizationListItemDto>> SearchAsync(
        OrganizationSearchRequest request, 
        CancellationToken cancellationToken = default);
    
    Task<OrganizationDetailDto?> GetByIdAsync(
        int entityId, 
        CancellationToken cancellationToken = default);
    
    Task<OrganizationDetailDto?> GetByPermalinkAsync(
        string permalink, 
        CancellationToken cancellationToken = default);
}
