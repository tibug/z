using CrunchbaseExplorer.Server.Services;
using CrunchbaseExplorer.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CrunchbaseExplorer.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GlobalSearchController : ControllerBase
{
    private readonly IGlobalSearchService _service;

    public GlobalSearchController(IGlobalSearchService service)
    {
        _service = service;
    }

    /// <summary>
    /// Global search across all entity types
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<GlobalSearchResultDto>>> Search(
        [FromQuery] GlobalSearchRequest request,
        CancellationToken ct)
    {
        var results = await _service.SearchAsync(request, ct);
        return Ok(results);
    }
}
