using CrunchbaseExplorer.Server.Services;
using CrunchbaseExplorer.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CrunchbaseExplorer.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FundingRoundsController : ControllerBase
{
    private readonly IFundingRoundService _service;

    public FundingRoundsController(IFundingRoundService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<FundingRoundListItemDto>>> Search(
        [FromQuery] FundingRoundSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("search")]
    public async Task<ActionResult<PagedResult<FundingRoundListItemDto>>> SearchPost(
        [FromBody] FundingRoundSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FundingRoundDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("by-permalink/{permalink}")]
    public async Task<ActionResult<FundingRoundDetailDto>> GetByPermalink(string permalink, CancellationToken ct)
    {
        var result = await _service.GetByPermalinkAsync(permalink, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
