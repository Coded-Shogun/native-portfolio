import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FileText, Calendar, Building2, MapPin, CheckCircle, Clock, XCircle, Gift } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  interviewDate?: string;
  job: {
    title: string;
    companyName: string;
    location: string;
    locationType: string;
    recruiter: {
      companyName: string;
    };
  };
}

interface ApplicationStats {
  total: number;
  submitted: number;
  reviewing: number;
  interview: number;
  offer: number;
  rejected: number;
  accepted: number;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/jobs/applications/me');
      setApplications(response.data.applications);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'reviewing':
        return <FileText className="h-5 w-5 text-yellow-600" />;
      case 'interview':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'offer':
        return <Gift className="h-5 w-5 text-green-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'offer':
        return 'bg-green-100 text-green-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">Track your job applications and interview progress</p>
            </div>
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <div className="card">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('submitted')}>
              <div className="text-sm text-gray-600">Submitted</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{stats.submitted}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('reviewing')}>
              <div className="text-sm text-gray-600">Reviewing</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.reviewing}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('interview')}>
              <div className="text-sm text-gray-600">Interview</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">{stats.interview}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('offer')}>
              <div className="text-sm text-gray-600">Offers</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.offer}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('accepted')}>
              <div className="text-sm text-gray-600">Accepted</div>
              <div className="text-2xl font-bold text-green-700 mt-1">{stats.accepted}</div>
            </div>
            <div className="card cursor-pointer" onClick={() => setFilter('rejected')}>
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6 flex items-center space-x-4">
          <span className="text-sm text-gray-600">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          {['submitted', 'reviewing', 'interview', 'offer', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                filter === status ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">
              Start applying to jobs and track your progress here.
            </p>
            <Link to="/job-recommendations" className="btn-primary">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{application.job.title}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(application.status)}`}>
                        {application.status}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{application.job.companyName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{application.job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {format(new Date(application.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    {application.interviewDate && (
                      <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm inline-flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Interview: {format(new Date(application.interviewDate), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(application.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
