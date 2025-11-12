import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Bookmark,
  ExternalLink,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface JobMatch {
  job: any;
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  strengthAreas: string[];
  improvementSuggestions: string[];
}

export default function JobRecommendations() {
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPreferences, setHasPreferences] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/jobs/recommendations');
      setMatches(response.data.matches);
      setHasPreferences(response.data.hasCareerPreferences);
    } catch (error: any) {
      toast.error('Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/apply`, {});
      toast.success('Application submitted!');
      fetchRecommendations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleSave = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/save`, {});
      toast.success('Job saved!');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

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
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Target className="h-8 w-8 text-primary-600" />
                <span>Job Recommendations</span>
              </h1>
              <p className="text-gray-600 mt-1">AI-powered job matches based on your profile</p>
            </div>
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* No Preferences Warning */}
        {!hasPreferences && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900">Set Your Career Preferences</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Get better job matches by setting your career preferences, desired roles, and salary expectations.
              </p>
              <Link to="/career-preferences" className="btn-primary mt-3 inline-block">
                Set Preferences
              </Link>
            </div>
          </div>
        )}

        {/* Match Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600">Total Matches</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{matches.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Excellent Matches</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {matches.filter(m => m.matchScore >= 80).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Good Matches</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Avg Match Score</div>
            <div className="text-2xl font-bold text-primary-600 mt-1">
              {matches.length > 0
                ? Math.round(matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length)
                : 0}
              %
            </div>
          </div>
        </div>

        {/* Job Matches */}
        {matches.length === 0 ? (
          <div className="card text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Matches Yet</h3>
            <p className="text-gray-600 mb-4">
              Complete your profile and set career preferences to get personalized job recommendations.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/editor" className="btn-primary">
                Complete Profile
              </Link>
              <Link to="/career-preferences" className="btn-secondary">
                Set Preferences
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <JobMatchCard
                key={match.job.id}
                match={match}
                onApply={() => handleApply(match.job.id)}
                onSave={() => handleSave(match.job.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobMatchCard({
  match,
  onApply,
  onSave,
}: {
  match: JobMatch;
  onApply: () => void;
  onSave: () => void;
}) {
  const { job, matchScore, matchReasons, missingSkills, strengthAreas, improvementSuggestions } = match;
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(matchScore)}`}>
              {matchScore}% Match
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span>{job.recruiter.companyName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location} • {job.locationType}</span>
            </div>
            {job.showSalary && job.salaryMin && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{job.employmentType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Why this matches:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchReasons.map((reason, i) => (
              <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                {reason}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strength Areas */}
      {strengthAreas.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Your strengths:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {strengthAreas.map((area, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <span>Skills to develop:</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.slice(0, 5).map((skill, i) => (
              <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-3 pt-4 border-t">
        <button onClick={onApply} className="btn-primary flex-1">
          Apply Now
        </button>
        <button onClick={onSave} className="btn-secondary">
          <Bookmark className="h-5 w-5" />
        </button>
        <button onClick={() => setShowDetails(!showDetails)} className="btn-secondary">
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
        <a
          href={`/jobs/${job.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <ExternalLink className="h-5 w-5" />
        </a>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
            <p className="text-gray-700 text-sm">{job.description}</p>
          </div>

          {improvementSuggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💡 Improvement Suggestions</h4>
              <ul className="space-y-2">
                {improvementSuggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start space-x-2">
                    <span className="text-primary-600">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill: string, i: number) => (
                <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
