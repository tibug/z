import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, ArrowLeft, Building2, TrendingUp, 
  Briefcase, GraduationCap, Calendar, MapPin
} from 'lucide-react';
import apiClient from '../../api/client';
import type { PersonDetailDto } from '../../types/models';

const fetchPersonByPermalink = async (permalink: string): Promise<PersonDetailDto> => {
  const response = await apiClient.get<PersonDetailDto>(`/people/by-permalink/${permalink}`);
  return response.data;
};

export function PersonDetailPage() {
  const { permalink } = useParams<{ permalink: string }>();

  const { data: person, isLoading, error } = useQuery({
    queryKey: ['person', permalink],
    queryFn: () => fetchPersonByPermalink(permalink!),
    enabled: !!permalink,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Person not found</p>
        <Link to="/people" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to people
        </Link>
      </div>
    );
  }

  const formatNumber = (value?: number) => {
    if (!value) return '0';
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link 
        to="/people" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to people
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 h-28 w-28 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-4xl">
            {person.imageUrl ? (
              <img className="h-28 w-28 rounded-full object-cover" src={person.imageUrl} alt={person.displayName} />
            ) : (
              person.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{person.displayName}</h1>
            
            {person.primaryOrganizationName && (
              <div className="flex items-center mt-2 text-lg">
                <Building2 className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-700">{person.primaryJobTitle || 'Works at'} </span>
                <Link 
                  to={`/organizations/${person.primaryOrganizationName.toLowerCase().replace(/\s+/g, '-')}`}
                  className="ml-1 text-blue-600 hover:underline font-medium"
                >
                  {person.primaryOrganizationName}
                </Link>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
              {person.gender && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                  {person.gender}
                </span>
              )}
              {person.bornOn && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Born {new Date(person.bornOn).toLocaleDateString()}
                </div>
              )}
            </div>

            {person.shortDescription && (
              <p className="mt-4 text-gray-600 max-w-2xl">{person.shortDescription}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Rank</p>
              <p className="text-2xl font-bold text-green-600">
                {person.rankPerson ? `#${Math.round(person.rankPerson).toLocaleString()}` : '-'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(person.numJobs)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Founded</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(person.numFoundedOrganizations)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Investments</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(person.numInvestments)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Partner Deals</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(person.numPartnerInvestments)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Work Experience */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Work Experience
          </h2>
          {person.jobs?.length > 0 ? (
            <div className="space-y-4">
              {person.jobs.map((job) => (
                <div key={job.jobId} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">{job.title || 'Unknown Position'}</h3>
                      {job.isCurrent && (
                        <span className="text-xs text-green-600 font-medium">Current</span>
                      )}
                    </div>
                    <p className="text-sm text-blue-600">{job.organizationName || 'Unknown Company'}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {job.startedOn && new Date(job.startedOn).getFullYear()}
                      {' - '}
                      {job.isCurrent ? 'Present' : job.endedOn ? new Date(job.endedOn).getFullYear() : 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No work experience recorded</p>
          )}
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education
          </h2>
          {person.degrees?.length > 0 ? (
            <div className="space-y-4">
              {person.degrees.map((degree) => (
                <div key={degree.degreeId} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{degree.schoolName || 'Unknown School'}</h3>
                    <p className="text-sm text-gray-600">
                      {degree.degreeType}{degree.subject ? ` in ${degree.subject}` : ''}
                    </p>
                    {degree.completedOn && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completed {new Date(degree.completedOn).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No education recorded</p>
          )}
        </div>
      </div>

      {/* Founded Organizations */}
      {person.foundedOrganizations?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Founded Organizations ({person.foundedOrganizations.length})
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {person.foundedOrganizations.map((org) => (
              <Link
                key={org.organizationId}
                to={`/organizations/${org.permalink}`}
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {org.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{org.displayName}</p>
                  {org.title && <p className="text-xs text-gray-500">{org.title}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
