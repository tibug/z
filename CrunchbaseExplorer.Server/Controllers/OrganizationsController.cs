using CrunchbaseExplorer.Server.Services;
using CrunchbaseExplorer.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CrunchbaseExplorer.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _service;

    public OrganizationsController(IOrganizationService service)
    {
        _service = service;
    }

    /// <summary>
    /// Search organizations with filters, sorting and paging
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<OrganizationListItemDto>>> Search(
        [FromQuery] OrganizationSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// Search organizations via POST (for complex filters)
    /// </summary>
    [HttpPost("search")]
    public async Task<ActionResult<PagedResult<OrganizationListItemDto>>> SearchPost(
        [FromBody] OrganizationSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// Get organization detail by ID
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrganizationDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    /// <summary>
    /// Get organization detail by permalink
    /// </summary>
    [HttpGet("by-permalink/{permalink}")]
    public async Task<ActionResult<OrganizationDetailDto>> GetByPermalink(string permalink, CancellationToken ct)
    {
        var result = await _service.GetByPermalinkAsync(permalink, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
