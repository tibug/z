namespace CrunchbaseExplorer.Shared.DTOs;

public class AcquisitionListItemDto
{
    public int AcquisitionId { get; set; }
    public int? AcquirerOrganizationId { get; set; }
    public string? AcquirerName { get; set; }
    public string? AcquirerPermalink { get; set; }
    public int? AcquireeOrganizationId { get; set; }
    public string? AcquireeName { get; set; }
    public string? AcquireePermalink { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public DateTime? CompletedOn { get; set; }
    public long? PriceUsd { get; set; }
    public long? Price { get; set; }  // Alias
    public string? AcquisitionStatus { get; set; }
    public string? Status { get; set; }  // Alias
    public string? AcquisitionType { get; set; }
    public int? RankAcquisition { get; set; }
    public int TotalCount { get; set; }
}

public class AcquisitionSearchRequest : PagedRequest
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int? AcquirerOrganizationId { get; set; }
    public int? AcquireeOrganizationId { get; set; }
    public long? MinPrice { get; set; }
    public long? MaxPrice { get; set; }
    public string? AcquisitionStatus { get; set; }
    public string? AcquisitionType { get; set; }
}

public class AcquisitionDetailDto
{
    public int AcquisitionId { get; set; }
    public DateTime? AnnouncedOn { get; set; }
    public DateTime? CompletedOn { get; set; }
    public string? AcquisitionType { get; set; }
    public long? PriceUsd { get; set; }
    public string? PriceCurrency { get; set; }
    public string? PaymentType { get; set; }
    public string? AcquisitionStatus { get; set; }
    public string? TermsJson { get; set; }

    // Acquirer
    public int? AcquirerOrganizationId { get; set; }
    public string? AcquirerName { get; set; }
    public string? AcquirerPermalink { get; set; }

    // Acquiree
    public int? AcquireeOrganizationId { get; set; }
    public string? AcquireeName { get; set; }
    public string? AcquireePermalink { get; set; }

    // Metrics
    public int? RankAcquisition { get; set; }
}
