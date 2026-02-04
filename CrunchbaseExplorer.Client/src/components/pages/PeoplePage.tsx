import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MapPin, Filter, Search, TrendingUp, 
  Briefcase, Building2, GraduationCap, X
} from 'lucide-react';
import apiClient from '../../api/client';
import { DataTable } from '../common/DataTable';
import type { PersonListItemDto, PersonSearchRequest, PagedResult } from '../../types/models';

const fetchPeople = async (params: PersonSearchRequest): Promise<PagedResult<PersonListItemDto>> => {
  const response = await apiClient.get<PagedResult<PersonListItemDto>>('/people', { params });
  return response.data;
};

const genders = [
  { value: '', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export function PeoplePage() {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PersonSearchRequest>({
    pageNumber: 1,
    pageSize: 25,
    sortColumn: 'RankPerson',
    sortDirection: 'Ascending',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['people', filters],
    queryFn: () => fetchPeople(filters),
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

  const handleRowClick = (person: PersonListItemDto) => {
    navigate(`/people/${person.permalink}`);
  };

  const clearFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 25,
      sortColumn: 'RankPerson',
      sortDirection: 'Ascending',
    });
  };

  const hasActiveFilters = filters.gender || filters.isInvestor || filters.searchText;

  const formatNumber = (value?: number) => {
    if (!value) return '-';
    return value.toLocaleString();
  };

  const columns = [
    {
      key: 'person',
      header: 'Person',
      width: '280px',
      sortable: true,
      render: (person: PersonListItemDto) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
            {person.imageUrl ? (
              <img className="h-10 w-10 rounded-full object-cover" src={person.imageUrl} alt="" />
            ) : (
              person.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 hover:text-blue-600">{person.displayName}</div>
            <div className="text-xs text-gray-500">{person.permalink}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'primaryOrganizationName',
      header: 'Organization',
      width: '200px',
      render: (person: PersonListItemDto) => (
        <div className="text-sm">
          {person.primaryOrganizationName ? (
            <div className="flex items-center text-gray-900">
              <Building2 className="w-3 h-3 mr-1 text-gray-400" />
              {person.primaryOrganizationName}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
          {person.primaryJobTitle && (
            <div className="text-xs text-gray-500 mt-0.5">{person.primaryJobTitle}</div>
          )}
        </div>
      ),
    },
    {
      key: 'gender',
      header: 'Gender',
      width: '80px',
      render: (person: PersonListItemDto) => (
        person.gender ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {person.gender}
          </span>
        ) : '-'
      ),
    },
    {
      key: 'jobs',
      header: 'Experience',
      width: '120px',
      render: (person: PersonListItemDto) => (
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center" title="Total Jobs">
            <Briefcase className="w-3 h-3 mr-1 text-blue-400" />
            <span className="text-gray-600">{formatNumber(person.numJobs)}</span>
          </div>
          <div className="flex items-center" title="Founded Organizations">
            <GraduationCap className="w-3 h-3 mr-1 text-purple-400" />
            <span className="text-gray-600">{formatNumber(person.numFoundedOrganizations)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'investments',
      header: 'Investments',
      width: '120px',
      render: (person: PersonListItemDto) => (
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center" title="Direct Investments">
            <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
            <span className="text-gray-600">{formatNumber(person.numInvestments)}</span>
          </div>
          <div className="flex items-center" title="Partner Investments">
            <Users className="w-3 h-3 mr-1 text-orange-400" />
            <span className="text-gray-600">{formatNumber(person.numPartnerInvestments)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'rankPerson',
      header: 'Rank',
      width: '80px',
      sortable: true,
      render: (person: PersonListItemDto) => (
        <div className="text-sm font-semibold text-green-600">
          {person.rankPerson ? `#${Math.round(person.rankPerson).toLocaleString()}` : '-'}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading people. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover executives, founders, and investors
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
          placeholder="Search people by name..."
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.gender || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value || undefined, pageNumber: 1 }))}
              >
                {genders.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Is Investor</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={filters.isInvestor === undefined ? '' : String(filters.isInvestor)}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isInvestor: e.target.value === '' ? undefined : e.target.value === 'true',
                  pageNumber: 1 
                }))}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
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
              <span className="font-semibold text-gray-900">{data.totalCount.toLocaleString()}</span> people
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
