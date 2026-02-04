namespace CrunchbaseExplorer.Shared.DTOs;

public class LocationDto
{
    public Guid LocationUuid { get; set; }
    public string? Name { get; set; }
    public string? Permalink { get; set; }
    public string? LocationType { get; set; }
    public bool IsPrimary { get; set; }
}

public class CategoryDto
{
    public Guid CategoryUuid { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Permalink { get; set; }
    public bool? IsPrimary { get; set; }
}

public class PressReferenceDto
{
    public long PressReferenceId { get; set; }
    public string? Title { get; set; }
    public string? Publisher { get; set; }
    public string? Author { get; set; }
    public DateTime? PublishedOn { get; set; }
    public string? Url { get; set; }
}

public class GlobalSearchResultDto
{
    public int EntityId { get; set; }
    public Guid Uuid { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ImageUrl { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public double? Rank { get; set; }
    public int MatchRank { get; set; }
}

public class GlobalSearchRequest
{
    public string SearchText { get; set; } = string.Empty;
    public string? EntityTypes { get; set; } // Comma-separated
    public int TopN { get; set; } = 10;
}
