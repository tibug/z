using System.ComponentModel.DataAnnotations;

namespace CrunchbaseExplorer.Shared.DTOs;

/// <summary>
/// Generic paged result wrapper for all list endpoints
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}

/// <summary>
/// Base request for all paged, filtered, and sorted endpoints
/// </summary>
public class PagedRequest
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 500)]
    public int PageSize { get; set; } = 25;

    public string? SortColumn { get; set; }
    public SortDirection SortDirection { get; set; } = SortDirection.Ascending;
    public List<FilterDescriptor>? Filters { get; set; }
}

public class FilterDescriptor
{
    public string Field { get; set; } = string.Empty;
    public FilterOperator Operator { get; set; } = FilterOperator.Equals;
    public string? Value { get; set; }
    public string? ValueTo { get; set; } // For range operators
}

public enum SortDirection
{
    Ascending,
    Descending
}

public enum FilterOperator
{
    Equals,
    NotEquals,
    Contains,
    StartsWith,
    EndsWith,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Between,
    In,
    IsNull,
    IsNotNull
}

public enum EntityType
{
    Organization,
    Person,
    FundingRound,
    Investment,
    Acquisition,
    Event
}
