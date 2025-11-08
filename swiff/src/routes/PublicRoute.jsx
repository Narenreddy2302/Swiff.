import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Loader from '../components/common/Loader';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  // If authenticated, redirect to dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
