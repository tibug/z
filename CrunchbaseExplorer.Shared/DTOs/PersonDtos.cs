namespace CrunchbaseExplorer.Shared.DTOs;

public class PersonListItemDto
{
    public int PersonId { get; set; }
    public int EntityId { get; set; }
    public Guid Uuid { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Gender { get; set; }
    public int? PrimaryOrganizationId { get; set; }
    public string? PrimaryOrganizationName { get; set; }
    public string? PrimaryJobTitle { get; set; }
    public string? Location { get; set; }
    public bool? IsInvestor { get; set; }
    public double? RankPerson { get; set; }
    public int? NumJobs { get; set; }
    public int? NumCurrentJobs { get; set; }
    public int? NumFoundedOrganizations { get; set; }
    public int? NumInvestments { get; set; }
    public int? NumPartnerInvestments { get; set; }
    public int? NumEventAppearances { get; set; }
    public int? NumArticles { get; set; }
    public int TotalCount { get; set; }
}

public class PersonSearchRequest : PagedRequest
{
    public string? Gender { get; set; }
    public int? PrimaryOrganizationId { get; set; }
    public int? MinFoundedOrgs { get; set; }
    public int? MaxFoundedOrgs { get; set; }
    public int? MinInvestments { get; set; }
    public int? MaxInvestments { get; set; }
    public bool? IsInvestor { get; set; }
    public bool? HasEventAppearances { get; set; }
    public string? SearchText { get; set; }
}

/// <summary>
/// Complete person detail with all fields
/// </summary>
public class PersonDetailDto
{
    // Core Identity
    public int EntityId { get; set; }
    public Guid Uuid { get; set; }
    public string Permalink { get; set; } = string.Empty;
    
    // Name
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    
    // Profile
    public string? ImageUrl { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? Gender { get; set; }
    
    // Location
    public string? LocationCity { get; set; }
    public string? LocationCountry { get; set; }
    public string? LocationCountryCode { get; set; }
    
    // Primary Job
    public string? PrimaryJobTitle { get; set; }
    public string? PrimaryOrganizationName { get; set; }
    public int? PrimaryOrganizationId { get; set; }
    public string? PrimaryOrganizationPermalink { get; set; }
    
    // Job Metrics
    public int? NumJobs { get; set; }
    public int? NumCurrentJobs { get; set; }
    public int? NumPastJobs { get; set; }
    public int? NumCurrentAdvisorJobs { get; set; }
    public int? NumPastAdvisorJobs { get; set; }
    public int? NumFoundedOrganizations { get; set; }
    
    // Investment Metrics
    public int? NumInvestments { get; set; }
    public int? NumPortfolioOrganizations { get; set; }
    public int? NumPartnerInvestments { get; set; }
    public int? NumLeadInvestments { get; set; }
    public int? NumOwnInvestments { get; set; }
    public int? NumDiversitySpotlightInvestments { get; set; }
    
    // Other Metrics
    public int? NumEventAppearances { get; set; }
    public int? NumArticles { get; set; }
    public int? NumExits { get; set; }
    public int? NumExitsIpo { get; set; }
    
    // Investor Profile
    public string? InvestorType { get; set; }
    public string? InvestorStage { get; set; }
    
    // Ranking
    public double? RankPerson { get; set; }
    public double? RankDeltaD7 { get; set; }
    public double? RankDeltaD30 { get; set; }
    public double? RankDeltaD90 { get; set; }
    
    // Social & Contact
    public string? WebsiteUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? FacebookUrl { get; set; }
    
    // Birth/Death
    public DateTime? BornOn { get; set; }
    public string? BornOnPrecision { get; set; }
    public DateTime? DiedOn { get; set; }
    public string? DiedOnPrecision { get; set; }
    
    // Metadata
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Aliases (JSON arrays from DB)
    public string? AliasesJson { get; set; }
    public string? PermalinkAliasesJson { get; set; }
    
    // Related Data
    public List<JobDto> Jobs { get; set; } = new();
    public List<DegreeDto> Degrees { get; set; } = new();
    public List<FoundedOrgDto> FoundedOrganizations { get; set; } = new();
    public List<PersonInvestmentDto> Investments { get; set; } = new();
    public List<string> Aliases { get; set; } = new();
    public List<string> PermalinkAliases { get; set; } = new();
}

public class JobDto
{
    public long JobId { get; set; }
    public int? OrganizationId { get; set; }
    public string? OrganizationName { get; set; }
    public string? OrganizationPermalink { get; set; }
    public string? Title { get; set; }
    public string? JobType { get; set; }
    public DateTime? StartedOn { get; set; }
    public string? StartedOnPrecision { get; set; }
    public DateTime? EndedOn { get; set; }
    public string? EndedOnPrecision { get; set; }
    public bool? IsCurrent { get; set; }
    public string? LocationText { get; set; }
}

public class DegreeDto
{
    public long DegreeId { get; set; }
    public string? SchoolName { get; set; }
    public string? Subject { get; set; }
    public string? DegreeType { get; set; }
    public DateTime? StartedOn { get; set; }
    public DateTime? CompletedOn { get; set; }
}

public class FoundedOrgDto
{
    public int OrganizationId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Title { get; set; }
    public bool? IsPrimary { get; set; }
}

public class PersonInvestmentDto
{
    public int InvestmentId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? FundedOrgName { get; set; }
    public string? FundedOrgPermalink { get; set; }
    public int? FundedOrgId { get; set; }
    public string? InvestmentType { get; set; }
    public bool? IsLeadInvestor { get; set; }
    public long? AmountUsd { get; set; }
}
