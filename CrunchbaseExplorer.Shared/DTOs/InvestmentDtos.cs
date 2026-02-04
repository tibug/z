namespace CrunchbaseExplorer.Shared.DTOs;

public class InvestmentListItemDto
{
    public int InvestmentId { get; set; }
    public int? FundingRoundId { get; set; }
    public int? InvestorEntityId { get; set; }
    public string? InvestorName { get; set; }
    public string? InvestorPermalink { get; set; }
    public string? InvestorType { get; set; }
    public int? FundedOrganizationId { get; set; }
    public string? FundedOrganizationName { get; set; }
    public string? FundedOrgName { get; set; }  // Alias
    public string? FundedOrganizationPermalink { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? FundingRoundName { get; set; }  // Added for frontend
    public long? FundingRoundMoneyRaisedUsd { get; set; }
    public bool? IsLeadInvestor { get; set; }
    public long? AmountUsd { get; set; }
    public long? Amount { get; set; }  // Alias for AmountUsd
    public int? PartnerCount { get; set; }
    public int TotalCount { get; set; }
}

public class InvestmentSearchRequest : PagedRequest
{
    public int? InvestorEntityId { get; set; }
    public int? FundedOrganizationId { get; set; }
    public int? FundingRoundId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public long? MinAmount { get; set; }
    public long? MaxAmount { get; set; }
}

public class InvestmentDetailDto
{
    public int InvestmentId { get; set; }
    public int? FundingRoundId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public string? Role { get; set; }
    public string? FundingRoundInvestmentType { get; set; }
    public long? FundingRoundMoneyRaisedUsd { get; set; }

    // Investor
    public int? InvestorEntityId { get; set; }
    public string? InvestorName { get; set; }
    public string? InvestorPermalink { get; set; }

    // Funded org
    public int? FundedOrganizationId { get; set; }
    public string? FundedOrganizationName { get; set; }
    public string? FundedOrganizationPermalink { get; set; }

    // Metrics
    public bool? IsLeadInvestor { get; set; }
    public long? AmountUsd { get; set; }
    public int? PartnerCount { get; set; }

    // Partners
    public List<PartnerDto> Partners { get; set; } = new();
}

public class PartnerDto
{
    public long InvestmentPartnerId { get; set; }
    public int PartnerEntityId { get; set; }
    public string? PartnerName { get; set; }
    public string? PartnerPermalink { get; set; }
    public string? Role { get; set; }
}
