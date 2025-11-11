import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  LayoutDashboard,
  Edit,
  Share2,
  LogOut,
  Briefcase,
  Award,
  FolderKanban,
  Building2,
  Star,
  Target,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioStats {
  completionScore: number;
  projectCount: number;
  certificationCount: number;
  workHistoryCount: number;
  achievementCount: number;
  skillCount: number;
  isPublic: boolean;
  shareableUrl: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/portfolio/stats');
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (stats?.shareableUrl) {
      navigator.clipboard.writeText(stats.shareableUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const completionScore = stats?.completionScore || 0;
  const isComplete = completionScore >= 80;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold">Portfolio Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={logout} className="text-gray-700 hover:text-red-600">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Warning */}
        {!user?.isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Verify your email</h3>
              <p className="text-sm text-yellow-700">
                Please check your inbox and verify your email address to unlock all features.
              </p>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your professional portfolio and track your progress
          </p>
        </div>

        {/* Profile Completion */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Target className="h-6 w-6 text-primary-600" />
                <span>Profile Completion</span>
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isComplete
                  ? 'Your portfolio looks great!'
                  : 'Complete your profile to stand out to recruiters'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">{completionScore}%</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all ${
                isComplete ? 'bg-green-500' : 'bg-primary-600'
              }`}
              style={{ width: `${completionScore}%` }}
            />
          </div>

          {isComplete && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Portfolio complete!</span>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<FolderKanban className="h-8 w-8 text-blue-600" />}
            title="Projects"
            value={stats?.projectCount || 0}
            color="blue"
          />
          <StatCard
            icon={<Award className="h-8 w-8 text-purple-600" />}
            title="Certifications"
            value={stats?.certificationCount || 0}
            color="purple"
          />
          <StatCard
            icon={<Building2 className="h-8 w-8 text-green-600" />}
            title="Work Experience"
            value={stats?.workHistoryCount || 0}
            color="green"
          />
          <StatCard
            icon={<Star className="h-8 w-8 text-yellow-600" />}
            title="Achievements"
            value={stats?.achievementCount || 0}
            color="yellow"
          />
          <StatCard
            icon={<Target className="h-8 w-8 text-red-600" />}
            title="Skills"
            value={stats?.skillCount || 0}
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Edit className="h-5 w-5 text-primary-600" />
              <span>Manage Portfolio</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Edit your portfolio, add projects, certifications, and more.
            </p>
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary w-full"
            >
              Edit Portfolio
            </button>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-primary-600" />
              <span>Share Your Portfolio</span>
            </h3>
            <p className="text-gray-600 mb-4">
              Copy your unique portfolio link to share with recruiters.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={copyShareLink}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <a
                href={stats?.shareableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center justify-center px-4"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}
