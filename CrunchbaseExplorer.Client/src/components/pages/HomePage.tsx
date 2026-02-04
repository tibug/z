import { Link } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, TrendingUp, ArrowRight,
  Search, Briefcase, Target, Award, Globe, Zap
} from 'lucide-react';

export function HomePage() {
  const features = [
    {
      title: 'Organizations',
      description: 'Explore millions of companies with detailed funding, metrics, and relationship data.',
      icon: Building2,
      href: '/organizations',
      color: 'from-blue-500 to-blue-600',
      stats: '10M+',
    },
    {
      title: 'People',
      description: 'Discover key executives, founders, and investors across the startup ecosystem.',
      icon: Users,
      href: '/people',
      color: 'from-green-500 to-green-600',
      stats: '5M+',
    },
    {
      title: 'Funding Rounds',
      description: 'Track investment activity and funding trends across industries.',
      icon: DollarSign,
      href: '#',
      color: 'from-purple-500 to-purple-600',
      stats: '2M+',
    },
    {
      title: 'Acquisitions',
      description: 'Monitor M&A activity and strategic exits in the tech ecosystem.',
      icon: TrendingUp,
      href: '#',
      color: 'from-orange-500 to-orange-600',
      stats: '500K+',
    },
  ];

  const highlights = [
    { icon: Zap, title: 'Real-time Data', description: 'Live updates from global markets' },
    { icon: Search, title: 'Advanced Search', description: 'Powerful filtering and search capabilities' },
    { icon: Target, title: 'Accurate Insights', description: 'Verified data from trusted sources' },
    { icon: Globe, title: 'Global Coverage', description: 'Companies from 150+ countries' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative px-8 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Discover the World's
            <br />
            <span className="text-blue-200">Business Information</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            The most comprehensive database of startups, investors, and funding rounds. 
            Make informed decisions with data you can trust.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/organizations"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Explore Organizations
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/people"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors border border-blue-400"
            >
              Discover People
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Explore Our Data</h2>
          <p className="text-gray-600 mt-2">Comprehensive coverage across the entire startup ecosystem</p>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <span className="text-2xl font-bold text-blue-600">{feature.stats}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                Explore
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-2xl border border-gray-200 p-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Why Crunchbase Explorer?</h2>
          <p className="text-gray-600 mt-2">Built for performance and reliability</p>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {highlights.map((item) => (
            <div key={item.title} className="text-center">
              <div className="w-14 h-14 mx-auto bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 rounded-2xl p-10 text-white">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Database Overview</h2>
          <p className="text-gray-400 mt-2">Powering insights with comprehensive data</p>
        </div>
        <div className="grid grid-cols-4 gap-8">
          <div className="text-center p-6 bg-gray-800 rounded-xl">
            <p className="text-4xl font-bold text-blue-400">10M+</p>
            <p className="text-gray-400 mt-1">Organizations</p>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-xl">
            <p className="text-4xl font-bold text-green-400">5M+</p>
            <p className="text-gray-400 mt-1">People</p>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-xl">
            <p className="text-4xl font-bold text-purple-400">2M+</p>
            <p className="text-gray-400 mt-1">Funding Rounds</p>
          </div>
          <div className="text-center p-6 bg-gray-800 rounded-xl">
            <p className="text-4xl font-bold text-orange-400">150+</p>
            <p className="text-gray-400 mt-1">Countries</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to explore?
        </h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Start discovering companies, people, and funding data today.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/organizations"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
