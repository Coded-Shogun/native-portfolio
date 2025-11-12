import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PortfolioEditor from './pages/PortfolioEditor';
import PublicPortfolio from './pages/PublicPortfolio';
import Marketplace from './pages/Marketplace';
import JobRecommendations from './pages/JobRecommendations';
import CareerPreferences from './pages/CareerPreferences';
import MyApplications from './pages/MyApplications';
import SkillsGapAnalysis from './pages/SkillsGapAnalysis';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/portfolio/:slug" element={<PublicPortfolio />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/editor"
          element={
            <PrivateRoute>
              <PortfolioEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/job-recommendations"
          element={
            <PrivateRoute>
              <JobRecommendations />
            </PrivateRoute>
          }
        />
        <Route
          path="/career-preferences"
          element={
            <PrivateRoute>
              <CareerPreferences />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <PrivateRoute>
              <MyApplications />
            </PrivateRoute>
          }
        />
        <Route
          path="/skills-gap"
          element={
            <PrivateRoute>
              <SkillsGapAnalysis />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
