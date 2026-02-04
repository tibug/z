import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, DollarSign, Filter, Search, 
  TrendingUp, Users, X, ChevronDown, Globe, Briefcase
} from 'lucide-react';
import { organizationsApi } from '../../api/organizationsApi';
import { DataTable } from '../common/DataTable';
import type { OrganizationListItemDto, OrganizationSearchRequest } from '../../types/models';

const companyTypes = [
  { value: '', label: 'All Types' },
  { value: 'for_profit', label: 'For Profit' },
  { value: 'non_profit', label: 'Non Profit' },
];

const operatingStatuses = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'ipo', label: 'IPO' },
  { value: 'acquired', label: 'Acquired' },
];

const fundingStages = [
  { value: '', label: 'All Stages' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
  { value: 'late_stage', label: 'Late Stage' },
];

const employeeRanges = [
  { value: '', label: 'All Sizes' },
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1001-5000', label: '1001-5000' },
  { value: '5001-10000', label: '5001-10000' },
  { value: '10001+', label: '10000+' },
];

export function OrganizationsPage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrganizationSearchRequest>({
    pageNumber: 1,
    pageSize: 25,
    sortColumn: 'Rank',
    sortDirection: 'Ascending',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', filters],
    queryFn: () => organizationsApi.search(filters),
  });

  const handleSort = (column: string) => {
    setFilters(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'Ascending' 
        ? 'Descending' 
        : 'Ascending',
      pageNumber: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  const handleRowClick = (org: OrganizationListItemDto) => {
    navigate(`/organizations/${org.permalink}`);
  };

  const clearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 25,
      sortColumn: 'Rank',
      sortDirection: 'Ascending',
    });
  };

  const hasActiveFilters = filters.companyType || filters.operatingStatus || 
    filters.countryCode || filters.fundingStage || filters.numEmployeesEnum || filters.searchText;

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatNumber = (value?: number) => {
    if (!value) return '-';
    return value.toLocaleString();
  };

  const columns = [
    {
      key: 'company',
      header: 'Company',
      width: '300px',
      sortable: true,
      render: (org: OrganizationListItemDto) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {org.imageUrl ? (
              <img className="h-10 w-10 rounded-lg object-cover" src={org.imageUrl} alt="" />
            ) : (
              org.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 hover:text-blue-600">{org.displayName}</div>
            <div className="text-xs text-gray-500">{org.permalink}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      width: '150px',
      render: (org: OrganizationListItemDto) => (
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
          {org.city && org.countryCode 
            ? `${org.city}, ${org.countryCode}` 
            : org.countryCode || org.city || '-'}
        </div>
      ),
    },
    {
      key: 'fundingStage',
      header: 'Stage',
      width: '120px',
      render: (org: OrganizationListItemDto) => (
        org.fundingStage ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {org.fundingStage}
          </span>
        ) : '-'
      ),
    },
    {
      key: 'fundingTotalUsd',
      header: 'Total Funding',
      width: '130px',
      sortable: true,
      render: (org: OrganizationListItemDto) => (
        <div className="flex items-center text-sm font-medium text-gray-900">
          <DollarSign className="w-3 h-3 mr-1 text-green-500" />
          {formatCurrency(org.fundingTotalUsd)}
        </div>
      ),
    },
    {
      key: 'numEmployeesEnum',
      header: 'Employees',
      width: '100px',
      render: (org: OrganizationListItemDto) => (
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-3 h-3 mr-1 text-gray-400" />
          {org.numEmployeesEnum || '-'}
        </div>
      ),
    },
    {
      key: 'metrics',
      header: 'Metrics',
      width: '200px',
      render: (org: OrganizationListItemDto) => (
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center" title="Funding Rounds">
            <Briefcase className="w-3 h-3 mr-1 text-blue-400" />
            <span className="text-gray-600">{formatNumber(org.numFundingRounds)}</span>
          </div>
          <div className="flex items-center" title="Investments">
            <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
            <span className="text-gray-600">{formatNumber(org.numInvestments)}</span>
          </div>
          <div className="flex items-center" title="Acquisitions">
            <Building2 className="w-3 h-3 mr-1 text-orange-400" />
            <span className="text-gray-600">{formatNumber(org.numAcquisitions)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'rank',
      header: 'Rank',
      width: '80px',
      sortable: true,
      render: (org: OrganizationListItemDto) => (
        <div className="text-sm font-semibold text-blue-600">
          {org.rank ? `#${Math.round(org.rank).toLocaleString()}` : '-'}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading organizations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover and track companies in the startup ecosystem
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              !
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search companies by name..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          value={filters.searchText || ''}
          onChange={(e) => setFilters(prev => ({ 
            ...prev, 
            searchText: e.target.value,
            pageNumber: 1 
          }))}
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.companyType || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, companyType: e.target.value || undefined, pageNumber: 1 }))}
              >
                {companyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.operatingStatus || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, operatingStatus: e.target.value || undefined, pageNumber: 1 }))}
              >
                {operatingStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Funding Stage</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.fundingStage || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, fundingStage: e.target.value || undefined, pageNumber: 1 }))}
              >
                {fundingStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Company Size</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.numEmployeesEnum || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, numEmployeesEnum: e.target.value || undefined, pageNumber: 1 }))}
              >
                {employeeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {data ? (
            <>
              Showing <span className="font-semibold text-gray-900">{data.items.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{data.totalCount.toLocaleString()}</span> companies
            </>
          ) : 'Loading...'}
        </p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        totalCount={data?.totalCount || 0}
        pageNumber={filters.pageNumber || 1}
        pageSize={filters.pageSize || 25}
        sortColumn={filters.sortColumn}
        sortDirection={filters.sortDirection?.toLowerCase() as 'asc' | 'desc'}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        keyExtractor={(item) => item.entityId}
      />
    </div>
  );
}
