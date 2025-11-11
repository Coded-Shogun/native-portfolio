import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Portfolio, Project, Certification, WorkHistory, Achievement, Skill } from '../types';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  FolderKanban,
  Award,
  Building2,
  Star,
  Target,
} from 'lucide-react';

type Tab = 'basic' | 'projects' | 'certifications' | 'work' | 'achievements' | 'skills';

export default function PortfolioEditor() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio/me');
      setPortfolio(response.data.portfolio);
    } catch (error) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold">Edit Portfolio</h1>
            </div>
            <div className="text-sm text-gray-600">
              Completion: <span className="font-bold text-primary-600">{portfolio.completionScore}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="flex overflow-x-auto">
            <TabButton
              active={activeTab === 'basic'}
              onClick={() => setActiveTab('basic')}
              icon={<User className="h-5 w-5" />}
              label="Basic Info"
            />
            <TabButton
              active={activeTab === 'projects'}
              onClick={() => setActiveTab('projects')}
              icon={<FolderKanban className="h-5 w-5" />}
              label="Projects"
              count={portfolio.projects.length}
            />
            <TabButton
              active={activeTab === 'certifications'}
              onClick={() => setActiveTab('certifications')}
              icon={<Award className="h-5 w-5" />}
              label="Certifications"
              count={portfolio.certifications.length}
            />
            <TabButton
              active={activeTab === 'work'}
              onClick={() => setActiveTab('work')}
              icon={<Building2 className="h-5 w-5" />}
              label="Work History"
              count={portfolio.workHistory.length}
            />
            <TabButton
              active={activeTab === 'achievements'}
              onClick={() => setActiveTab('achievements')}
              icon={<Star className="h-5 w-5" />}
              label="Achievements"
              count={portfolio.achievements.length}
            />
            <TabButton
              active={activeTab === 'skills'}
              onClick={() => setActiveTab('skills')}
              icon={<Target className="h-5 w-5" />}
              label="Skills"
              count={portfolio.skills.length}
            />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'basic' && (
          <BasicInfoTab portfolio={portfolio} onUpdate={fetchPortfolio} />
        )}
        {activeTab === 'projects' && (
          <ProjectsTab projects={portfolio.projects} onUpdate={fetchPortfolio} />
        )}
        {activeTab === 'certifications' && (
          <CertificationsTab certifications={portfolio.certifications} onUpdate={fetchPortfolio} />
        )}
        {activeTab === 'work' && (
          <WorkHistoryTab workHistory={portfolio.workHistory} onUpdate={fetchPortfolio} />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab achievements={portfolio.achievements} onUpdate={fetchPortfolio} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab skills={portfolio.skills} onUpdate={fetchPortfolio} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-primary-600 text-primary-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );
}

// Basic Info Tab
function BasicInfoTab({ portfolio, onUpdate }: { portfolio: Portfolio; onUpdate: () => void }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: portfolio.title || '',
      tagline: portfolio.tagline || '',
      bio: portfolio.bio || '',
      phone: portfolio.phone || '',
      location: portfolio.location || '',
      website: portfolio.website || '',
      linkedinUrl: portfolio.linkedinUrl || '',
      githubUrl: portfolio.githubUrl || '',
      twitterUrl: portfolio.twitterUrl || '',
      isPublic: portfolio.isPublic,
      isSearchable: portfolio.isSearchable,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await api.put('/portfolio/me', data);
      toast.success('Portfolio updated!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update portfolio');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

      <div className="space-y-4">
        <div>
          <label className="label">Professional Title</label>
          <input type="text" className="input" {...register('title')} placeholder="e.g., Full Stack Developer" />
        </div>

        <div>
          <label className="label">Tagline</label>
          <input type="text" className="input" {...register('tagline')} placeholder="A short catchy tagline" />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={4} {...register('bio')} placeholder="Tell us about yourself..." />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone</label>
            <input type="tel" className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input type="text" className="input" {...register('location')} placeholder="City, Country" />
          </div>
        </div>

        <div>
          <label className="label">Website</label>
          <input type="url" className="input" {...register('website')} placeholder="https://..." />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">LinkedIn URL</label>
            <input type="url" className="input" {...register('linkedinUrl')} />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input type="url" className="input" {...register('githubUrl')} />
          </div>
          <div>
            <label className="label">Twitter URL</label>
            <input type="url" className="input" {...register('twitterUrl')} />
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('isPublic')} className="rounded" />
            <span>Make portfolio public</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" {...register('isSearchable')} className="rounded" />
            <span>Show in marketplace</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" className="btn-primary flex items-center space-x-2">
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}

// Simplified CRUD tabs (Projects, Certifications, etc.)
function ProjectsTab({ projects, onUpdate }: { projects: Project[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Project</span>
        </button>
      </div>

      {showForm && <ProjectForm onSuccess={() => { setShowForm(false); onUpdate(); }} />}

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-lg">{project.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/projects', {
        ...data,
        technologies: data.technologies ? data.technologies.split(',').map((t: string) => t.trim()) : [],
      });
      toast.success('Project added!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add project');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card">
      <h3 className="font-semibold mb-4">New Project</h3>
      <div className="space-y-3">
        <input type="text" className="input" {...register('title', { required: true })} placeholder="Project Title" />
        <textarea className="input" {...register('description', { required: true })} placeholder="Description" rows={3} />
        <input type="text" className="input" {...register('technologies')} placeholder="Technologies (comma-separated)" />
        <input type="url" className="input" {...register('projectUrl')} placeholder="Project URL (optional)" />
        <button type="submit" className="btn-primary">Add Project</button>
      </div>
    </form>
  );
}

// Similar simplified tabs for other sections
function CertificationsTab({ certifications, onUpdate }: { certifications: Certification[]; onUpdate: () => void }) {
  return <div className="card"><p>Certifications management (similar to projects)</p></div>;
}

function WorkHistoryTab({ workHistory, onUpdate }: { workHistory: WorkHistory[]; onUpdate: () => void }) {
  return <div className="card"><p>Work history management (similar to projects)</p></div>;
}

function AchievementsTab({ achievements, onUpdate }: { achievements: Achievement[]; onUpdate: () => void }) {
  return <div className="card"><p>Achievements management (similar to projects)</p></div>;
}

function SkillsTab({ skills, onUpdate }: { skills: Skill[]; onUpdate: () => void }) {
  return <div className="card"><p>Skills management (similar to projects)</p></div>;
}
