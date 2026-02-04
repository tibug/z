import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, MapPin, Globe, Linkedin, Twitter, 
  Users, DollarSign, TrendingUp, ArrowLeft,
  Calendar, Mail, Phone, Briefcase, Target,
  Award, Newspaper, TrendingDown
} from 'lucide-react';
import { organizationsApi } from '../../api/organizationsApi';
import { format } from 'date-fns';

export function OrganizationDetailPage() {
  const { permalink } = useParams<{ permalink: string }>();

  const { data: org, isLoading, error } = useQuery({
    queryKey: ['organization', permalink],
    queryFn: () => organizationsApi.getByPermalink(permalink!),
    enabled: !!permalink,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Organization not found</p>
        <Link to="/organizations" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to organizations
        </Link>
      </div>
    );
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value}`;
  };

  const formatNumber = (value?: number) => value?.toLocaleString() || '0';

  const getRankChangeIcon = (delta?: number) => {
    if (!delta) return null;
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link 
        to="/organizations" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to organizations
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 h-28 w-28 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl">
            {org.imageUrl ? (
              <img className="h-28 w-28 rounded-xl object-cover" src={org.imageUrl} alt={org.displayName} />
            ) : (
              org.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{org.displayName}</h1>
            {org.legalName && org.legalName !== org.displayName && (
              <p className="text-lg text-gray-500 mt-1">{org.legalName}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {org.companyType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {org.companyType}
                </span>
              )}
              {org.operatingStatus && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  org.operatingStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {org.operatingStatus}
                </span>
              )}
              {org.ipoStatus && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {org.ipoStatus}
                </span>
              )}
              {org.fundingStage && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  {org.fundingStage}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-600">
              {(org.city || org.countryCode) && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {[org.city, org.countryCode].filter(Boolean).join(', ')}
                </div>
              )}
              {org.foundedOn && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Founded {format(new Date(org.foundedOn), 'MMM yyyy')}
                </div>
              )}
              {org.websiteUrl && (
                <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center text-blue-600 hover:underline">
                  <Globe className="w-4 h-4 mr-1" />
                  Website
                </a>
              )}
              {org.linkedinUrl && (
                <a href={org.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center text-blue-600 hover:underline">
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </a>
              )}
              {org.twitterUrl && (
                <a href={org.twitterUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center text-blue-600 hover:underline">
                  <Twitter className="w-4 h-4 mr-1" />
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {org.shortDescription && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-700 leading-relaxed">{org.shortDescription}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Funding</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(org.fundingTotalUsd)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Rank</p>
              <div className="flex items-center">
                <p className="text-xl font-bold text-gray-900">{org.rank ? `#${Math.round(org.rank).toLocaleString()}` : '-'}</p>
                {getRankChangeIcon(org.rankDeltaD7)}
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Employees</p>
              <p className="text-xl font-bold text-gray-900">{org.numEmployeesEnum || '-'}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Rounds</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(org.numFundingRounds)}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Investments</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(org.numInvestments)}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Acquisitions</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(org.numAcquisitions)}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Award className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Categories */}
          {org.categories?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Industries</h2>
              <div className="flex flex-wrap gap-2">
                {org.categories.map((cat) => (
                  <span 
                    key={cat.categoryUuid}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      cat.isPrimary 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Founders */}
          {org.founders?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Founders ({org.founders.length})</h2>
              <div className="grid grid-cols-2 gap-4">
                {org.founders.map((founder) => (
                  <Link 
                    key={founder.personId}
                    to={`/people/${founder.permalink}`}
                    className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                      {founder.imageUrl ? (
                        <img className="h-12 w-12 rounded-full object-cover" src={founder.imageUrl} alt="" />
                      ) : (
                        founder.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-gray-900">{founder.displayName}</p>
                      {founder.title && <p className="text-xs text-gray-500">{founder.title}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Funding Rounds */}
          {org.fundingRounds?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Funding History ({org.fundingRounds.length} rounds)</h2>
              <div className="space-y-3">
                {org.fundingRounds.slice(0, 5).map((round) => (
                  <div key={round.fundingRoundId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {round.investmentType || 'Funding Round'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {round.announcedOn && format(new Date(round.announcedOn), 'MMM yyyy')}
                          {round.fundingStage && ` • ${round.fundingStage}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(round.moneyRaisedUsd)}</p>
                      <p className="text-xs text-gray-500">{round.numInvestors} investors</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Locations */}
          {org.locations?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Locations</h2>
              <div className="space-y-3">
                {org.locations.map((loc) => (
                  <div key={loc.locationUuid} className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className={loc.isPrimary ? 'font-medium text-gray-900' : 'text-gray-600'}>
                      {loc.name}
                    </span>
                    {loc.isPrimary && (
                      <span className="ml-2 text-xs text-blue-600">(HQ)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(org.contactEmail || org.phoneNumber) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3">
                {org.contactEmail && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${org.contactEmail}`} className="text-blue-600 hover:underline">
                      {org.contactEmail}
                    </a>
                  </div>
                )}
                {org.phoneNumber && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{org.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Revenue & Employees */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
            <div className="space-y-4">
              {org.revenueRangeCode && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue Range</p>
                  <p className="text-sm font-medium text-gray-900">{org.revenueRangeCode}</p>
                </div>
              )}
              {org.numEmployeesEnum && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Employee Count</p>
                  <p className="text-sm font-medium text-gray-900">{org.numEmployeesEnum}</p>
                </div>
              )}
              {org.lastFundingAt && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Last Funding</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(org.lastFundingAt), 'MMM yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stock Info */}
          {org.stockSymbol && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h2>
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-3">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{org.stockSymbol}</p>
                  <p className="text-xs text-gray-500">Publicly Traded</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
