using CrunchbaseExplorer.Server.Infrastructure.Database;
using CrunchbaseExplorer.Shared.DTOs;
using Dapper;
using System.Data;
using System.Text.Json;

namespace CrunchbaseExplorer.Server.Repositories;

public interface IEventRepository
{
    Task<PagedResult<EventListItemDto>> SearchAsync(EventSearchRequest request, CancellationToken ct = default);
    Task<EventDetailDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EventDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default);
}

public class EventRepository : IEventRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public EventRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<PagedResult<EventListItemDto>> SearchAsync(EventSearchRequest request, CancellationToken ct = default)
    {
        const string sql = @"
            WITH FilteredEvents AS (
                SELECT 
                    ev.EventId, 
                    ent.DisplayName AS EventName,
                    ent.DisplayName AS DisplayName,
                    ent.Permalink, 
                    ev.EventTypeJson,
                    CASE 
                        WHEN ev.EventTypeJson LIKE '%conference%' THEN 'Conference'
                        WHEN ev.EventTypeJson LIKE '%meetup%' THEN 'Meetup'
                        WHEN ev.EventTypeJson LIKE '%workshop%' THEN 'Workshop'
                        WHEN ev.EventTypeJson LIKE '%webinar%' THEN 'Webinar'
                        ELSE 'Event'
                    END AS EventType,
                    ev.EventFormat, ev.StartsOn, ev.EndsOn, ev.EventStatus, ev.EventUrl,
                    ev.VenueName, ent.CountryCode, ent.City,
                    CASE 
                        WHEN ent.City IS NOT NULL AND ent.CountryCode IS NOT NULL THEN ent.City + ', ' + ent.CountryCode
                        WHEN ent.City IS NOT NULL THEN ent.City
                        WHEN ent.CountryCode IS NOT NULL THEN ent.CountryCode
                        ELSE NULL
                    END AS Location,
                    ISNULL(m.RankEvent, 999999) AS RankEvent, 
                    ISNULL(m.NumSpeakers, 0) AS NumSpeakers, 
                    ISNULL(m.NumOrganizers, 0) AS NumOrganizers, 
                    ISNULL(m.NumSponsors, 0) AS NumSponsors, 
                    ISNULL(m.NumExhibitors, 0) AS NumExhibitors,
                    ROW_NUMBER() OVER (
                        ORDER BY 
                            CASE WHEN @SortColumn = 'StartsOn' AND @SortDirection = 'ASC' THEN ev.StartsOn END ASC,
                            CASE WHEN @SortColumn = 'StartsOn' AND @SortDirection = 'DESC' THEN ev.StartsOn END DESC,
                            CASE WHEN @SortColumn = 'RankEvent' AND @SortDirection = 'ASC' THEN ISNULL(m.RankEvent, 999999) END ASC,
                            CASE WHEN @SortColumn = 'RankEvent' AND @SortDirection = 'DESC' THEN ISNULL(m.RankEvent, 999999) END DESC,
                            ev.EventId ASC
                    ) AS RowNum
                FROM cb.Event ev
                INNER JOIN cb.Entity ent ON ev.EventId = ent.EntityId
                LEFT JOIN cb.EventMetrics m ON ev.EventId = m.EventId
                WHERE ent.IsDeleted = 0
                  AND (@FromDate IS NULL OR ev.StartsOn >= @FromDate)
                  AND (@ToDate IS NULL OR ev.StartsOn <= @ToDate)
                  AND (@CountryCode IS NULL OR ent.CountryCode = @CountryCode)
                  AND (@City IS NULL OR ent.City LIKE @CityPattern)
                  AND (@MinSpeakers IS NULL OR ISNULL(m.NumSpeakers, 0) >= @MinSpeakers)
                  AND (@MinOrganizers IS NULL OR ISNULL(m.NumOrganizers, 0) >= @MinOrganizers)
                  AND (@MinSponsors IS NULL OR ISNULL(m.NumSponsors, 0) >= @MinSponsors)
            )
            SELECT 
                EventId, EventName, DisplayName, Permalink, EventType, EventTypeJson, EventFormat,
                StartsOn, EndsOn, EventStatus, EventUrl, VenueName, CountryCode, City, Location,
                RankEvent, NumSpeakers, NumOrganizers, NumSponsors, NumExhibitors,
                (SELECT COUNT(*) FROM FilteredEvents) AS TotalCount
            FROM FilteredEvents
            WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
            ORDER BY RowNum";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var results = await connection.QueryAsync<EventListItemDto>(sql, new
        {
            Offset = (request.PageNumber - 1) * request.PageSize,
            request.PageSize,
            SortColumn = request.SortColumn ?? "StartsOn",
            SortDirection = request.SortDirection == SortDirection.Ascending ? "ASC" : "DESC",
            request.FromDate, request.ToDate, request.CountryCode, 
            City = request.City,
            CityPattern = request.City != null ? $"{request.City}%" : null,
            request.MinSpeakers, request.MinOrganizers, request.MinSponsors
        }, commandTimeout: 60);

        var items = results.ToList();
        return new PagedResult<EventListItemDto>
        {
            Items = items,
            TotalCount = items.FirstOrDefault()?.TotalCount ?? 0,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    public async Task<EventDetailDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        
        const string sql = @"
            SELECT 
                -- Core Identity
                ev.EventId, 
                ent.DisplayName AS EventName, 
                ent.Permalink,
                
                -- Description
                ent.ShortDescription,
                ent.Description,
                ent.ImageUrl,
                
                -- Event Type
                ev.EventTypeJson,
                CASE 
                    WHEN ev.EventTypeJson LIKE '%conference%' THEN 'Conference'
                    WHEN ev.EventTypeJson LIKE '%meetup%' THEN 'Meetup'
                    WHEN ev.EventTypeJson LIKE '%workshop%' THEN 'Workshop'
                    WHEN ev.EventTypeJson LIKE '%webinar%' THEN 'Webinar'
                    ELSE 'Event'
                END AS EventType,
                ev.EventFormat, 
                ev.EventStatus,
                
                -- Dates
                ev.StartsOn, 
                ev.EndsOn,
                
                -- URLs
                ev.EventUrl, 
                ev.RegistrationUrl, 
                
                -- Location
                ev.VenueName,
                ent.City,
                ent.Region,
                ent.Country,
                ent.CountryCode,
                
                -- Ranking
                ISNULL(m.RankEvent, 0) AS RankEvent, 
                ISNULL(m.RankDeltaD7, 0) AS RankDeltaD7,
                ISNULL(m.RankDeltaD30, 0) AS RankDeltaD30,
                ISNULL(m.RankDeltaD90, 0) AS RankDeltaD90,
                
                -- Metrics
                ISNULL(m.NumSpeakers, 0) AS NumSpeakers, 
                ISNULL(m.NumOrganizers, 0) AS NumOrganizers, 
                ISNULL(m.NumSponsors, 0) AS NumSponsors, 
                ISNULL(m.NumExhibitors, 0) AS NumExhibitors, 
                ISNULL(m.NumContestants, 0) AS NumContestants,
                
                -- Metadata
                ent.PermalinkAliasesJson,
                ent.CreatedAt,
                ent.UpdatedAt
                
            FROM cb.Event ev
            INNER JOIN cb.Entity ent ON ev.EventId = ent.EntityId
            LEFT JOIN cb.EventMetrics m ON ev.EventId = m.EventId
            WHERE ev.EventId = @Id AND ent.IsDeleted = 0;";

        var evt = await connection.QueryFirstOrDefaultAsync<EventDetailDto>(sql, new { Id = id });
        if (evt == null) return null;

        // Parse permalink aliases
        if (!string.IsNullOrEmpty(evt.PermalinkAliasesJson))
        {
            try { evt.PermalinkAliases = JsonSerializer.Deserialize<List<string>>(evt.PermalinkAliasesJson) ?? new(); }
            catch { evt.PermalinkAliases = new(); }
        }

        // Load related data sequentially (MARS not enabled)
        var allParticipants = await GetParticipantsAsync(connection, id);
        
        evt.Speakers = allParticipants.Where(p => p.AppearanceType == "speaker").ToList();
        evt.Sponsors = allParticipants.Where(p => p.AppearanceType == "sponsor").ToList();
        evt.Contestants = allParticipants.Where(p => p.AppearanceType == "contestant").ToList();
        evt.Organizers = allParticipants.Where(p => p.AppearanceType == "organizer").ToList();
        evt.Exhibitors = allParticipants.Where(p => p.AppearanceType == "exhibitor").ToList();
        
        evt.PressReferences = await GetPressReferencesAsync(connection, id);

        return evt;
    }

    public async Task<EventDetailDto?> GetByPermalinkAsync(string permalink, CancellationToken ct = default)
    {
        const string sql = @"
            SELECT e.EntityId 
            FROM cb.Entity e 
            WHERE e.Permalink = @Permalink 
              AND e.EntityType = 'event'
              AND e.IsDeleted = 0;";

        using var connection = await _connectionFactory.CreateConnectionAsync(ct);
        var entityId = await connection.QueryFirstOrDefaultAsync<int?>(sql, new { Permalink = permalink });
        
        if (entityId == null) return null;
        return await GetByIdAsync(entityId.Value, ct);
    }

    private async Task<List<EventParticipantDto>> GetParticipantsAsync(IDbConnection connection, int eventId)
    {
        const string sql = @"
            SELECT 
                ea.EventAppearanceId,
                ea.AppearingEntityId AS ParticipantEntityId, 
                e.DisplayName AS ParticipantName, 
                e.Permalink AS ParticipantPermalink,
                e.ImageUrl AS ParticipantImageUrl,
                e.EntityType AS ParticipantType,
                ea.AppearanceType,
                ea.Role, 
                ea.Title,
                -- For person participants, get primary organization
                CASE WHEN e.EntityType = 'person' THEN p.PrimaryOrganizationId ELSE NULL END AS PrimaryOrganizationId,
                CASE WHEN e.EntityType = 'person' THEN po.DisplayName ELSE NULL END AS PrimaryOrganizationName,
                CASE WHEN e.EntityType = 'person' THEN po.Permalink ELSE NULL END AS PrimaryOrganizationPermalink
            FROM cb.EventAppearance ea
            INNER JOIN cb.Entity e ON ea.AppearingEntityId = e.EntityId
            LEFT JOIN cb.Person p ON e.EntityId = p.PersonId AND e.EntityType = 'person'
            LEFT JOIN cb.Entity po ON p.PrimaryOrganizationId = po.EntityId
            WHERE ea.EventId = @EventId AND e.IsDeleted = 0
            ORDER BY ea.AppearanceType, ea.SequenceNum, e.DisplayName;";

        var results = await connection.QueryAsync<EventParticipantDto>(sql, new { EventId = eventId });
        return results.ToList();
    }

    private async Task<List<PressReferenceDto>> GetPressReferencesAsync(IDbConnection connection, int eventId)
    {
        const string sql = @"
            SELECT TOP 10
                pr.PressReferenceId,
                pr.Title,
                pr.Publisher,
                pr.Author,
                pr.PublishedOn,
                pr.Url
            FROM cb.PressReference pr
            WHERE pr.EntityId = @EntityId
            ORDER BY pr.PublishedOn DESC;";

        var results = await connection.QueryAsync<PressReferenceDto>(sql, new { EntityId = eventId });
        return results.ToList();
    }
}
