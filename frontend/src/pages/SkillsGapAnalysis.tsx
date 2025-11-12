import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Target, TrendingUp, AlertTriangle, BookOpen, Award, ArrowLeft } from 'lucide-react';

interface AnalysisForm {
  targetRole: string;
  targetIndustry?: string;
}

interface AnalysisResult {
  analysis: {
    targetRole: string;
    readinessScore: number;
    totalRequiredSkills: number;
    matchedSkills: number;
    missingSkillsCount: number;
    estimatedTime: string;
  };
  details: {
    currentSkills: string[];
    requiredSkills: string[];
    missingSkills: string[];
    skillsToImprove: string[];
    prioritySkills: string[];
  };
  recommendations: {
    immediate: string;
    learningPaths: string[];
    certifications: string[];
  };
  motivationalMessage: string;
}

export default function SkillsGapAnalysis() {
  const { register, handleSubmit } = useForm<AnalysisForm>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: AnalysisForm) => {
    setLoading(true);
    try {
      const response = await api.post('/skills-gap/analyze', data);
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze skills gap');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <span>Skills Gap Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Discover what skills you need to land your dream job
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Analysis Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Analyze Your Skills</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Target Job Role*</label>
              <input
                type="text"
                className="input"
                {...register('targetRole', { required: true })}
                placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the job title you're aiming for
              </p>
            </div>

            <div>
              <label className="label">Target Industry (optional)</label>
              <input
                type="text"
                className="input"
                {...register('targetIndustry')}
                placeholder="e.g., Tech, Finance, Healthcare"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Skills Gap'}
            </button>
          </div>
        </form>

        {/* Analysis Results */}
        {result && (
          <div className="space-y-6">
            {/* Readiness Score */}
            <div className="card bg-gradient-to-r from-primary-50 to-blue-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {result.analysis.readinessScore}% Ready
                  </h2>
                  <p className="text-gray-600">For {result.analysis.targetRole}</p>
                </div>
                <div className="text-6xl font-bold text-primary-600">
                  {result.analysis.readinessScore}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                  className="bg-primary-600 h-4 rounded-full transition-all"
                  style={{ width: `${result.analysis.readinessScore}%` }}
                />
              </div>
              <p className="text-lg text-gray-700 font-medium">
                {result.motivationalMessage}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="card">
                <div className="text-sm text-gray-600">Matched Skills</div>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {result.analysis.matchedSkills}/{result.analysis.totalRequiredSkills}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Skills to Learn</div>
                <div className="text-3xl font-bold text-orange-600 mt-1">
                  {result.analysis.missingSkillsCount}
                </div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-600">Estimated Time</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">
                  {result.analysis.estimatedTime}
                </div>
              </div>
            </div>

            {/* Priority Skills */}
            {result.details.prioritySkills.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <span>Priority Skills to Learn</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  {result.recommendations.immediate}
                </p>
                <div className="flex flex-wrap gap-3">
                  {result.details.prioritySkills.map((skill, i) => (
                    <div key={i} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.details.missingSkills.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Target className="h-6 w-6 text-red-600" />
                  <span>All Missing Skills</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.details.missingSkills.map((skill, i) => (
                    <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills to Improve */}
            {result.details.skillsToImprove.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                  <span>Skills to Improve</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  You have these skills but could improve your proficiency
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.details.skillsToImprove.map((skill, i) => (
                    <span key={i} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Paths */}
            {result.recommendations.learningPaths.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span>Recommended Learning Paths</span>
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.learningPaths.map((path, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <span className="text-primary-600 font-bold">{i + 1}.</span>
                      <span className="text-gray-700">{path}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {result.recommendations.certifications.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                  <Award className="h-6 w-6 text-purple-600" />
                  <span>Recommended Certifications</span>
                </h3>
                <div className="space-y-2">
                  {result.recommendations.certifications.map((cert, i) => (
                    <div key={i} className="bg-purple-50 text-purple-700 px-4 py-3 rounded-lg">
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card bg-primary-50">
              <h3 className="text-lg font-semibold mb-4">Ready to Get Started?</h3>
              <div className="flex flex-wrap gap-3">
                <Link to="/editor" className="btn-primary">
                  Update My Skills
                </Link>
                <Link to="/job-recommendations" className="btn-secondary">
                  Browse Matching Jobs
                </Link>
                <Link to="/career-preferences" className="btn-secondary">
                  Set Career Goals
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
