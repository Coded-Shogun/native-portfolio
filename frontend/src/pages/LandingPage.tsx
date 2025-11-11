import { Link } from 'react-router-dom';
import { Briefcase, Users, Share2, Award } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Portfolio Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="text-gray-700 hover:text-primary-600">
                Browse Portfolios
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Showcase Your Professional Journey
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create a stunning portfolio to showcase your projects, certifications, work history,
            and achievements. Share it with recruiters and businesses worldwide.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Create Your Portfolio
            </Link>
            <Link to="/marketplace" className="btn-secondary text-lg px-8 py-3">
              Explore Portfolios
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Briefcase className="h-10 w-10 text-primary-600" />}
            title="Comprehensive Portfolio"
            description="Showcase projects, certifications, work history, and achievements all in one place."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary-600" />}
            title="Professional Marketplace"
            description="Connect with recruiters and businesses looking for talented professionals."
          />
          <FeatureCard
            icon={<Share2 className="h-10 w-10 text-primary-600" />}
            title="Easy Sharing"
            description="Generate shareable links to send your portfolio to anyone, anywhere."
          />
          <FeatureCard
            icon={<Award className="h-10 w-10 text-primary-600" />}
            title="Stand Out"
            description="Professional templates and completion tracking to ensure you shine."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-16 mt-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of professionals already showcasing their work
          </p>
          <Link to="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Create Free Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
