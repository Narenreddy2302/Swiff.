import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../../services/supabase/config';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link. Please try again.');
          return;
        }

        // Handle email verification
        if (type === 'signup' || type === 'email') {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'email',
          });

          if (error) {
            setStatus('error');
            setMessage(error.message || 'Verification failed. The link may have expired.');
            return;
          }

          setStatus('success');
          setMessage('Email verified successfully!');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        }
        // Handle password reset
        else if (type === 'recovery') {
          navigate('/reset-password', { replace: true });
        }
        // Default: try to get session
        else {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            setStatus('error');
            setMessage('Authentication failed. Please try logging in again.');
            return;
          }

          setStatus('success');
          setMessage('Successfully authenticated!');

          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-accent-blue animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your email address.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/verify-email')}
                  className="w-full px-6 py-3 bg-accent-red text-white rounded-lg hover:bg-[#C41E24] transition-colors font-medium"
                >
                  Request New Link
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Link */}
        {status === 'error' && (
          <p className="text-center text-xs text-gray-600 mt-6">
            Still having trouble?{' '}
            <a href="mailto:support@swiff.app" className="text-accent-blue hover:underline">
              Contact Support
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
