import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Portfolio } from '../types';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  ExternalLink,
  Calendar,
  Award,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';

export default function PublicPortfolio() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get(`/public/portfolio/${slug}`);
      setPortfolio(response.data.portfolio);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Portfolio not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/marketplace" className="btn-primary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${portfolio.user?.firstName || ''} ${portfolio.user?.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/marketplace" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{fullName}</h1>
              {portfolio.title && (
                <p className="text-xl text-primary-600 mb-2">{portfolio.title}</p>
              )}
              {portfolio.tagline && (
                <p className="text-gray-600 mb-4">{portfolio.tagline}</p>
              )}
              {portfolio.bio && (
                <p className="text-gray-700 mb-4">{portfolio.bio}</p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {portfolio.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{portfolio.location}</span>
                  </div>
                )}
                {portfolio.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{portfolio.phone}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                {portfolio.website && (
                  <a href={portfolio.website} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {portfolio.linkedinUrl && (
                  <a href={portfolio.linkedinUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {portfolio.githubUrl && (
                  <a href={portfolio.githubUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {portfolio.twitterUrl && (
                  <a href={portfolio.twitterUrl} target="_blank" rel="noopener noreferrer"
                     className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        {portfolio.skills.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <div key={skill.id} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                  {skill.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {portfolio.projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <div className="space-y-4">
              {portfolio.projects.map((project) => (
                <div key={project.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      {project.role && <p className="text-sm text-gray-600">{project.role}</p>}
                      <p className="text-gray-700 mt-2">{project.description}</p>
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {project.projectUrl && (
                      <a href={project.projectUrl} target="_blank" rel="noopener noreferrer"
                         className="ml-4 text-primary-600 hover:text-primary-700">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work History */}
        {portfolio.workHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Briefcase className="h-6 w-6" />
              <span>Work Experience</span>
            </h2>
            <div className="space-y-6">
              {portfolio.workHistory.map((work) => (
                <div key={work.id}>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{work.position}</h3>
                      <p className="text-primary-600">{work.company}</p>
                      {work.location && <p className="text-sm text-gray-600">{work.location}</p>}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(work.startDate), 'MMM yyyy')} -{' '}
                      {work.isCurrentJob ? 'Present' : format(new Date(work.endDate!), 'MMM yyyy')}
                    </div>
                  </div>
                  {work.description && <p className="text-gray-700 mt-2">{work.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {portfolio.certifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <span>Certifications</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {portfolio.certifications.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued: {format(new Date(cert.issueDate), 'MMM yyyy')}
                  </p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer"
                       className="text-primary-600 text-sm hover:underline mt-2 inline-block">
                      View Credential →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {portfolio.achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="space-y-4">
              {portfolio.achievements.map((achievement) => (
                <div key={achievement.id} className="border-l-4 border-primary-600 pl-4">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-gray-700 mt-1">{achievement.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(achievement.date), 'MMMM yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
