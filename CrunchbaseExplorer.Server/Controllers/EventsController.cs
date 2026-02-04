using CrunchbaseExplorer.Server.Services;
using CrunchbaseExplorer.Shared.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CrunchbaseExplorer.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly IEventService _service;

    public EventsController(IEventService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<EventListItemDto>>> Search(
        [FromQuery] EventSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("search")]
    public async Task<ActionResult<PagedResult<EventListItemDto>>> SearchPost(
        [FromBody] EventSearchRequest request,
        CancellationToken ct)
    {
        var result = await _service.SearchAsync(request, ct);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EventDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _service.GetByIdAsync(id, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("by-permalink/{permalink}")]
    public async Task<ActionResult<EventDetailDto>> GetByPermalink(string permalink, CancellationToken ct)
    {
        var result = await _service.GetByPermalinkAsync(permalink, ct);
        if (result == null) return NotFound();
        return Ok(result);
    }
}
