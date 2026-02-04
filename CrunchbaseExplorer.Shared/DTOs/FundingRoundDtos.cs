namespace CrunchbaseExplorer.Shared.DTOs;

public class FundingRoundListItemDto
{
    public int FundingRoundId { get; set; }
    public string? RoundName { get; set; }
    public string? Permalink { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? InvestmentType { get; set; }
    public string? InvestmentStage { get; set; }
    public string? FundingStage { get; set; }
    public bool? IsEquity { get; set; }
    public long? MoneyRaisedUsd { get; set; }
    public int? FundedOrganizationId { get; set; }
    public string? FundedOrganizationName { get; set; }
    public string? OrganizationName { get; set; }
    public string? FundedOrganizationPermalink { get; set; }
    public string? OrganizationPermalink { get; set; }
    public int? RankFundingRound { get; set; }
    public int? NumInvestors { get; set; }
    public int? NumLeadInvestors { get; set; }
    public int? NumPartners { get; set; }
    public int TotalCount { get; set; }
}

public class FundingRoundSearchRequest : PagedRequest
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? InvestmentType { get; set; }
    public string? InvestmentStage { get; set; }
    public bool? IsEquity { get; set; }
    public string? FundingStage { get; set; }
    public int? FundedOrganizationId { get; set; }
    public long? MinMoneyRaised { get; set; }
    public long? MaxMoneyRaised { get; set; }
}

/// <summary>
/// Complete funding round detail with all fields
/// </summary>
public class FundingRoundDetailDto
{
    // Core Identity
    public int FundingRoundId { get; set; }
    public string? RoundName { get; set; }
    public string? Permalink { get; set; }
    
    // Description
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    
    // Funded Organization
    public int? FundedOrganizationId { get; set; }
    public string? FundedOrganizationName { get; set; }
    public string? FundedOrganizationPermalink { get; set; }
    public string? FundedOrganizationStage { get; set; }
    public long? FundedOrganizationFundingTotalUsd { get; set; }
    public string? FundedOrganizationRevenueRange { get; set; }
    public string? FundedOrganizationImageUrl { get; set; }
    
    // Round Details
    public string? InvestmentType { get; set; }
    public string? InvestmentStage { get; set; }
    public string? FundingStage { get; set; }
    public bool? IsEquity { get; set; }
    
    // Dates
    public DateTime? AnnouncedOn { get; set; }
    public string? AnnouncedOnPrecision { get; set; }
    public DateTime? ClosedOn { get; set; }
    public string? ClosedOnPrecision { get; set; }
    
    // Money
    public long? MoneyRaisedUsd { get; set; }
    public long? TargetMoneyRaisedUsd { get; set; }
    public long? PreMoneyValuationUsd { get; set; }
    public long? PostMoneyValuationUsd { get; set; }
    
    // Metrics
    public int? RankFundingRound { get; set; }
    public double? Rank { get; set; }
    public int? NumInvestors { get; set; }
    public int? NumLeadInvestors { get; set; }
    public int? NumPartners { get; set; }
    
    // Metadata
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Related Data
    public List<InvestorDto> Investors { get; set; } = new();
    public List<CategoryDto> Categories { get; set; } = new();
    public List<CategoryGroupDto> CategoryGroups { get; set; } = new();
    public List<PressReferenceDto> PressReferences { get; set; } = new();
}

public class InvestorDto
{
    public long FundingRoundInvestorId { get; set; }
    public int InvestorEntityId { get; set; }
    public string? InvestorName { get; set; }
    public string? InvestorPermalink { get; set; }
    public string? InvestorType { get; set; }
    public string? InvestorImageUrl { get; set; }
    public bool? IsLeadInvestor { get; set; }
    public long? AmountUsd { get; set; }
    public string? Role { get; set; }
}
