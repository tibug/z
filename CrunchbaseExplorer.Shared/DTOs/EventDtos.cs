namespace CrunchbaseExplorer.Shared.DTOs;

public class EventListItemDto
{
    public int EventId { get; set; }
    public string? EventName { get; set; }
    public string? DisplayName { get; set; }
    public string? Permalink { get; set; }
    public string? EventType { get; set; }
    public string? EventTypeJson { get; set; }
    public string? EventFormat { get; set; }
    public DateTime? StartsOn { get; set; }
    public DateTime? EndsOn { get; set; }
    public string? EventStatus { get; set; }
    public string? EventUrl { get; set; }
    public string? VenueName { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public string? Location { get; set; }
    public double? RankEvent { get; set; }
    public int? NumSpeakers { get; set; }
    public int? NumOrganizers { get; set; }
    public int? NumSponsors { get; set; }
    public int? NumExhibitors { get; set; }
    public int TotalCount { get; set; }
}

public class EventSearchRequest : PagedRequest
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? EventTypeJson { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public int? MinSpeakers { get; set; }
    public int? MinOrganizers { get; set; }
    public int? MinSponsors { get; set; }
}

/// <summary>
/// Complete event detail with all fields
/// </summary>
public class EventDetailDto
{
    // Core Identity
    public int EventId { get; set; }
    public string EventName { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    
    // Description
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    
    // Event Type
    public string? EventType { get; set; }
    public string? EventTypeJson { get; set; }
    public string? EventFormat { get; set; }
    public string? EventStatus { get; set; }
    
    // Dates
    public DateTime? StartsOn { get; set; }
    public DateTime? EndsOn { get; set; }
    
    // URLs
    public string? EventUrl { get; set; }
    public string? RegistrationUrl { get; set; }
    
    // Location
    public string? VenueName { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; }
    public string? CountryCode { get; set; }
    
    // Ranking
    public double? RankEvent { get; set; }
    public double? RankDeltaD7 { get; set; }
    public double? RankDeltaD30 { get; set; }
    public double? RankDeltaD90 { get; set; }
    
    // Metrics
    public int? NumSpeakers { get; set; }
    public int? NumOrganizers { get; set; }
    public int? NumSponsors { get; set; }
    public int? NumExhibitors { get; set; }
    public int? NumContestants { get; set; }
    
    // Metadata
    public string? PermalinkAliasesJson { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Related Data
    public List<EventParticipantDto> Speakers { get; set; } = new();
    public List<EventParticipantDto> Sponsors { get; set; } = new();
    public List<EventParticipantDto> Contestants { get; set; } = new();
    public List<EventParticipantDto> Organizers { get; set; } = new();
    public List<EventParticipantDto> Exhibitors { get; set; } = new();
    public List<PressReferenceDto> PressReferences { get; set; } = new();
    public List<string> PermalinkAliases { get; set; } = new();
}

public class EventParticipantDto
{
    public long EventAppearanceId { get; set; }
    public int ParticipantEntityId { get; set; }
    public string? ParticipantName { get; set; }
    public string? ParticipantPermalink { get; set; }
    public string? ParticipantImageUrl { get; set; }
    public string? ParticipantType { get; set; }
    public string? AppearanceType { get; set; }
    public string? Role { get; set; }
    public string? Title { get; set; }
    
    // For speakers - primary organization
    public int? PrimaryOrganizationId { get; set; }
    public string? PrimaryOrganizationName { get; set; }
    public string? PrimaryOrganizationPermalink { get; set; }
}
