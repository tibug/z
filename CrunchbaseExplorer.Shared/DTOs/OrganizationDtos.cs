namespace CrunchbaseExplorer.Shared.DTOs;

/// <summary>
/// Organization list item for data grid
/// </summary>
public class OrganizationListItemDto
{
    public int OrganizationId { get; set; }
    public int EntityId { get; set; }
    public Guid Uuid { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public string? Location { get; set; }
    public string? ImageUrl { get; set; }
    public string? CompanyType { get; set; }
    public string? OperatingStatus { get; set; }
    public string? IpoStatus { get; set; }
    public string? RevenueRangeCode { get; set; }
    public string? NumEmployeesEnum { get; set; }
    public string? Employees { get; set; }
    public string? FundingStage { get; set; }
    public long? FundingTotalUsd { get; set; }
    public DateTime? LastFundingAt { get; set; }
    public string? LastFundingType { get; set; }
    public double? Rank { get; set; }
    public int? NumFundingRounds { get; set; }
    public int? NumInvestments { get; set; }
    public int? NumLeadInvestments { get; set; }
    public int? NumAcquisitions { get; set; }
    public int? NumExits { get; set; }
    public int? NumArticles { get; set; }
    public int TotalCount { get; set; }
}

/// <summary>
/// Organization search request with specific filters
/// </summary>
public class OrganizationSearchRequest : PagedRequest
{
    public string? CompanyType { get; set; }
    public string? OperatingStatus { get; set; }
    public string? IpoStatus { get; set; }
    public string? CountryCode { get; set; }
    public string? City { get; set; }
    public string? RevenueRangeCode { get; set; }
    public string? NumEmployeesEnum { get; set; }
    public string? FundingStage { get; set; }
    public long? MinFundingTotalUsd { get; set; }
    public long? MaxFundingTotalUsd { get; set; }
    public bool? HasStockListing { get; set; }
    public string? SearchText { get; set; }
}

/// <summary>
/// Complete organization detail with all fields
/// </summary>
public class OrganizationDetailDto
{
    // Core Identity
    public int EntityId { get; set; }
    public Guid Uuid { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string Permalink { get; set; } = string.Empty;
    
    // Description
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    
    // Location
    public string? HeadquartersCity { get; set; }
    public string? HeadquartersRegion { get; set; }
    public string? HeadquartersCountry { get; set; }
    public string? HeadquartersCountryCode { get; set; }
    public string? HeadquartersText { get; set; }
    
    // Company Profile
    public string? CompanyType { get; set; }
    public string? OperatingStatus { get; set; }
    public string? IpoStatus { get; set; }
    public DateTime? FoundedOn { get; set; }
    public DateTime? ClosedOn { get; set; }
    
    // Funding
    public string? FundingStage { get; set; }
    public long? TotalFundingUsd { get; set; }
    public string? LastFundingType { get; set; }
    public DateTime? LastFundingDate { get; set; }
    
    // Size
    public string? RevenueRange { get; set; }
    public string? EmployeeCountRange { get; set; }
    public int? EmployeeCountExact { get; set; }
    public int? NumEmployeesMin { get; set; }
    public int? NumEmployeesMax { get; set; }
    
    // Ranking
    public double? Rank { get; set; }
    public double? RankDeltaD7 { get; set; }
    public double? RankDeltaD30 { get; set; }
    public double? RankDeltaD90 { get; set; }
    
    // Metrics
    public int? NumArticles { get; set; }
    public int? NumFundingRounds { get; set; }
    public int? NumInvestments { get; set; }
    public int? NumLeadInvestments { get; set; }
    public int? NumAcquisitions { get; set; }
    public int? NumExits { get; set; }
    
    // Contact Info
    public string? WebsiteUrl { get; set; }
    public string? HomepageUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? PhoneNumber { get; set; }
    
    // Social Media
    public string? LinkedinUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? FacebookUrl { get; set; }
    
    // Stock
    public string? StockSymbol { get; set; }
    public string? StockExchangeSymbol { get; set; }
    
    // Metadata
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Aliases (JSON arrays from DB)
    public string? AliasesJson { get; set; }
    public string? PermalinkAliasesJson { get; set; }
    
    // Related Data
    public List<CategoryDto> Categories { get; set; } = new();
    public List<CategoryGroupDto> CategoryGroups { get; set; } = new();
    public List<LocationDto> Locations { get; set; } = new();
    public List<FounderDto> Founders { get; set; } = new();
    public List<FundingRoundSummaryDto> FundingRounds { get; set; } = new();
    public List<InvestmentSummaryDto> InvestmentsMade { get; set; } = new();
    public List<AcquisitionSummaryDto> AcquisitionsMade { get; set; } = new();
    public List<AcquisitionSummaryDto> WasAcquiredIn { get; set; } = new();
    public List<PressReferenceDto> PressReferences { get; set; } = new();
    public List<StockListingDto> StockListings { get; set; } = new();
    public List<string> Aliases { get; set; } = new();
    public List<string> PermalinkAliases { get; set; } = new();
}

public class CategoryGroupDto
{
    public Guid CategoryGroupUuid { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Permalink { get; set; }
    public bool? IsPrimary { get; set; }
}

public class FounderDto
{
    public int PersonId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Permalink { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? Title { get; set; }
    public bool? IsPrimary { get; set; }
}

public class FundingRoundSummaryDto
{
    public int FundingRoundId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? InvestmentType { get; set; }
    public string? FundingStage { get; set; }
    public long? MoneyRaisedUsd { get; set; }
    public int? NumInvestors { get; set; }
}

public class InvestmentSummaryDto
{
    public int InvestmentId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? FundedOrgName { get; set; }
    public string? FundedOrgPermalink { get; set; }
    public int? FundedOrgId { get; set; }
    public bool? IsLeadInvestor { get; set; }
    public long? AmountUsd { get; set; }
}

public class AcquisitionSummaryDto
{
    public int AcquisitionId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? OtherOrgName { get; set; }
    public string? OtherOrgPermalink { get; set; }
    public int? OtherOrgId { get; set; }
    public long? PriceUsd { get; set; }
    public string? AcquisitionStatus { get; set; }
    public bool IsAcquirer { get; set; }
}

public class StockListingDto
{
    public long StockListingId { get; set; }
    public string? Ticker { get; set; }
    public string? ExchangeSymbol { get; set; }
    public string? ExchangeName { get; set; }
    public DateTime? WentPublicOn { get; set; }
    public bool? IsActive { get; set; }
}
