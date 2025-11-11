import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Briefcase, MapPin, ExternalLink } from 'lucide-react';

interface MarketplacePortfolio {
  id: string;
  slug: string;
  title?: string;
  bio?: string;
  location?: string;
  user: {
    firstName: string;
    lastName: string;
  };
  skills: { name: string }[];
  projects: { id: string; title: string; imageUrl?: string }[];
  _count: {
    projects: number;
    certifications: number;
    workHistory: number;
  };
}

export default function Marketplace() {
  const [portfolios, setPortfolios] = useState<MarketplacePortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPortfolios();
  }, [search]);

  const fetchPortfolios = async () => {
    try {
      const response = await api.get('/public/marketplace', {
        params: { search: search || undefined, limit: 20 },
      });
      setPortfolios(response.data.portfolios);
    } catch (error) {
      console.error('Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold">Portfolio Manager</span>
            </Link>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discover Professional Talent
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Browse portfolios from talented professionals around the world
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, title, or skills..."
                className="input pl-12 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No portfolios found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard key={portfolio.id} portfolio={portfolio} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioCard({ portfolio }: { portfolio: MarketplacePortfolio }) {
  const fullName = `${portfolio.user.firstName} ${portfolio.user.lastName}`.trim();

  return (
    <Link to={`/portfolio/${portfolio.slug}`} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
          {portfolio.title && (
            <p className="text-primary-600 text-sm">{portfolio.title}</p>
          )}
        </div>
        <ExternalLink className="h-5 w-5 text-gray-400" />
      </div>

      {portfolio.location && (
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span>{portfolio.location}</span>
        </div>
      )}

      {portfolio.bio && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{portfolio.bio}</p>
      )}

      {/* Skills */}
      {portfolio.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {portfolio.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
              {skill.name}
            </span>
          ))}
          {portfolio.skills.length > 3 && (
            <span className="text-xs text-gray-500">+{portfolio.skills.length - 3} more</span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between text-sm text-gray-600 pt-3 border-t">
        <span>{portfolio._count.projects} Projects</span>
        <span>{portfolio._count.certifications} Certs</span>
        <span>{portfolio._count.workHistory} Jobs</span>
      </div>
    </Link>
  );
}
