import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import Loader from '../components/common/Loader';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  // Show loader while checking authentication
  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated - no email verification required
  return children;
};

export default PrivateRoute;
