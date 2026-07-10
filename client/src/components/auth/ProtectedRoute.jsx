import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SkeletonLoader from '../ui/SkeletonLoader';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse mx-auto" />
          <SkeletonLoader lines={4} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleRequired && user.role !== roleRequired && !(roleRequired === 'admin' && user.role === 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect to onboarding if not done and not already on onboarding
  if (!user.onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;
