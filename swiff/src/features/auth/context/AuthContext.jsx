import { createContext, useContext, useState, useEffect } from 'react';
// Import auth service based on environment
import * as supabaseAuth from '../../../services/api/supabaseAuthService';
import * as mockAuth from '../../../services/api/mockAuthService';

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const authService = useMockAuth ? mockAuth : supabaseAuth;
const { onAuthStateChange, getUserData, resendVerificationEmail } = authService;

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: authListener } = onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // User is signed in
          setCurrentUser(session.user);

          // Fetch additional user data from database
          const data = await getUserData(session.user.id);
          setUserData(data);
        } else {
          // User is signed out
          setCurrentUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    error,
    isAuthenticated: !!currentUser,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
