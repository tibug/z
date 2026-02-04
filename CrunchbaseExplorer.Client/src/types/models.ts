// Shared types from the backend

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedRequest {
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: string;
  sortDirection?: 'Ascending' | 'Descending';
}

// Organization types
export interface OrganizationListItemDto {
  entityId: number;
  uuid: string;
  displayName: string;
  permalink: string;
  countryCode?: string;
  city?: string;
  imageUrl?: string;
  companyType?: string;
  operatingStatus?: string;
  ipoStatus?: string;
  revenueRangeCode?: string;
  numEmployeesEnum?: string;
  fundingStage?: string;
  fundingTotalUsd?: number;
  lastFundingAt?: string;
  lastFundingType?: string;
  rank?: number;
  numFundingRounds?: number;
  numInvestments?: number;
  numLeadInvestments?: number;
  numAcquisitions?: number;
  numExits?: number;
  numArticles?: number;
  totalCount?: number;
}

export interface OrganizationSearchRequest extends PagedRequest {
  companyType?: string;
  operatingStatus?: string;
  ipoStatus?: string;
  countryCode?: string;
  city?: string;
  revenueRangeCode?: string;
  numEmployeesEnum?: string;
  fundingStage?: string;
  minFundingTotalUsd?: number;
  maxFundingTotalUsd?: number;
  hasStockListing?: boolean;
  searchText?: string;
}

export interface OrganizationDetailDto {
  entityId: number;
  uuid: string;
  displayName: string;
  legalName?: string;
  permalink: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  rank?: number;
  numArticles?: number;
  companyType?: string;
  operatingStatus?: string;
  ipoStatus?: string;
  foundedOn?: string;
  revenueRangeCode?: string;
  numEmployeesEnum?: string;
  headquartersText?: string;
  contactEmail?: string;
  phoneNumber?: string;
  fundingStage?: string;
  fundingTotalUsd?: number;
  lastFundingAt?: string;
  stockSymbol?: string;
  locations: LocationDto[];
  categories: CategoryDto[];
  founders: FounderDto[];
  fundingRounds: FundingRoundSummaryDto[];
}

export interface LocationDto {
  locationUuid: string;
  name?: string;
  permalink?: string;
  locationType?: string;
  isPrimary: boolean;
}

export interface CategoryDto {
  categoryUuid: string;
  name?: string;
  permalink?: string;
  isPrimary: boolean;
}

export interface FounderDto {
  personId: number;
  displayName: string;
  permalink: string;
  imageUrl?: string;
  title?: string;
  isPrimary?: boolean;
}

export interface FundingRoundSummaryDto {
  fundingRoundId: number;
  announcedOn?: string;
  investmentType?: string;
  fundingStage?: string;
  moneyRaisedUsd?: number;
  numInvestors?: number;
}

// Person types
export interface PersonListItemDto {
  entityId: number;
  uuid: string;
  displayName: string;
  permalink: string;
  imageUrl?: string;
  gender?: string;
  primaryOrganizationId?: number;
  primaryOrganizationName?: string;
  primaryJobTitle?: string;
  rankPerson?: number;
  numJobs?: number;
  numCurrentJobs?: number;
  numFoundedOrganizations?: number;
  numInvestments?: number;
  numPartnerInvestments?: number;
  numEventAppearances?: number;
  numArticles?: number;
  totalCount?: number;
}

export interface PersonSearchRequest extends PagedRequest {
  gender?: string;
  primaryOrganizationId?: number;
  minFoundedOrgs?: number;
  maxFoundedOrgs?: number;
  minInvestments?: number;
  maxInvestments?: number;
  isInvestor?: boolean;
  hasEventAppearances?: boolean;
  searchText?: string;
}

// Global search
export interface GlobalSearchResultDto {
  entityId: number;
  uuid: string;
  entityType: string;
  displayName: string;
  permalink: string;
  shortDescription?: string;
  imageUrl?: string;
  countryCode?: string;
  city?: string;
  rank?: number;
  matchRank: number;
}
