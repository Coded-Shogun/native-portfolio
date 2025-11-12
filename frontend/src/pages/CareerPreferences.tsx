import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Target, Save, ArrowLeft } from 'lucide-react';

interface PreferencesForm {
  isActivelySeeking: boolean;
  isOpenToOffers: boolean;
  desiredRoles: string;
  preferredLocations: string;
  workPreference: string;
  employmentType: string[];
  minSalary?: number;
  maxSalary?: number;
  careerGoals?: string;
  willingToRelocate: boolean;
  needsVisa: boolean;
}

export default function CareerPreferences() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue } = useForm<PreferencesForm>();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/career-preferences');
      if (response.data.preferences) {
        const prefs = response.data.preferences;
        setValue('isActivelySeeking', prefs.isActivelySeeking);
        setValue('isOpenToOffers', prefs.isOpenToOffers);
        setValue('desiredRoles', prefs.desiredRoles.join(', '));
        setValue('preferredLocations', prefs.preferredLocations.join(', '));
        setValue('workPreference', prefs.workPreference || '');
        setValue('employmentType', prefs.employmentType || []);
        setValue('minSalary', prefs.minSalary);
        setValue('maxSalary', prefs.maxSalary);
        setValue('careerGoals', prefs.careerGoals);
        setValue('willingToRelocate', prefs.willingToRelocate);
        setValue('needsVisa', prefs.needsVisa);
      }
    } catch (error) {
      console.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PreferencesForm) => {
    try {
      await api.post('/career-preferences', {
        ...data,
        desiredRoles: data.desiredRoles.split(',').map(r => r.trim()).filter(Boolean),
        preferredLocations: data.preferredLocations.split(',').map(l => l.trim()).filter(Boolean),
      });
      toast.success('Career preferences saved!');
      navigate('/job-recommendations');
    } catch (error) {
      toast.error('Failed to save preferences');
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 flex items-center space-x-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Target className="h-8 w-8 text-primary-600" />
            <span>Career Preferences</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Help us find the perfect job opportunities for you
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="card">
          {/* Job Search Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Job Search Status</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('isActivelySeeking')} className="rounded" />
                <span>I am actively seeking opportunities</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('isOpenToOffers')} className="rounded" />
                <span>I am open to hearing about opportunities</span>
              </label>
            </div>
          </div>

          {/* Desired Roles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What You're Looking For</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Desired Job Titles (comma-separated)</label>
                <input
                  type="text"
                  className="input"
                  {...register('desiredRoles')}
                  placeholder="e.g., Full Stack Developer, Software Engineer, Backend Developer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  List the job titles you're interested in
                </p>
              </div>

              <div>
                <label className="label">Preferred Locations (comma-separated)</label>
                <input
                  type="text"
                  className="input"
                  {...register('preferredLocations')}
                  placeholder="e.g., Remote, San Francisco, New York, London"
                />
              </div>

              <div>
                <label className="label">Work Preference</label>
                <select className="input" {...register('workPreference')}>
                  <option value="">Select...</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employment Type */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Employment Type</h2>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" value="Full-time" {...register('employmentType')} className="rounded" />
                <span>Full-time</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" value="Part-time" {...register('employmentType')} className="rounded" />
                <span>Part-time</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" value="Contract" {...register('employmentType')} className="rounded" />
                <span>Contract</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" value="Freelance" {...register('employmentType')} className="rounded" />
                <span>Freelance</span>
              </label>
            </div>
          </div>

          {/* Compensation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Compensation Expectations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Minimum Salary (USD/year)</label>
                <input
                  type="number"
                  className="input"
                  {...register('minSalary')}
                  placeholder="e.g., 80000"
                />
              </div>
              <div>
                <label className="label">Maximum Salary (USD/year)</label>
                <input
                  type="number"
                  className="input"
                  {...register('maxSalary')}
                  placeholder="e.g., 150000"
                />
              </div>
            </div>
          </div>

          {/* Career Goals */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Career Goals</h2>
            <textarea
              className="input"
              rows={4}
              {...register('careerGoals')}
              placeholder="Describe your career goals, what you want to achieve, industries you're interested in..."
            />
          </div>

          {/* Additional Preferences */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Additional</h2>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('willingToRelocate')} className="rounded" />
                <span>Willing to relocate</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" {...register('needsVisa')} className="rounded" />
                <span>Require visa sponsorship</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Save Preferences</span>
            </button>
            <Link to="/dashboard" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
