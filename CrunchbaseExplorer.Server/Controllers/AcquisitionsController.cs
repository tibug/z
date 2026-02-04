using CrunchbaseExplorer.Server.Services;
using CrunchbaseExplorer.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CrunchbaseExplorer.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AcquisitionsController : ControllerBase
{
    private readonly IAcquisitionService _service;

    public AcquisitionsController(IAcquisitionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<AcquisitionListItemDto>>> Search(
        [FromQuery] AcquisitionSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("search")]
    public async Task<ActionResult<PagedResult<AcquisitionListItemDto>>> SearchPost(
        [FromBody] AcquisitionSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AcquisitionDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
