import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../../../components/common/Button/Button';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { currentUser, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  // If already verified, redirect to dashboard
  useEffect(() => {
    if (currentUser?.email_confirmed_at) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    setResendError('');

    try {
      await resendVerificationEmail();
      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setResendError(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo/Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-accent-blue"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a verification link to
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {currentUser?.email || 'your email'}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Check your inbox
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Click the verification link in the email to activate your account. The link will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-white text-xs flex items-center justify-center font-medium">
                1
              </div>
              <p className="text-sm text-gray-700">Open your email inbox</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-white text-xs flex items-center justify-center font-medium">
                2
              </div>
              <p className="text-sm text-gray-700">Find the email from Swiff</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-blue text-white text-xs flex items-center justify-center font-medium">
                3
              </div>
              <p className="text-sm text-gray-700">Click "Verify Email" button</p>
            </div>
          </div>

          {/* Success Message */}
          {resendMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{resendMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {resendError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{resendError}</p>
            </div>
          )}

          {/* Resend Email Button */}
          <div className="space-y-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <p className="text-center text-xs text-gray-600">
              Didn't receive the email? Check your spam folder or click resend.
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-accent-blue hover:text-[#2845B8] transition-colors font-medium"
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Need help? Contact support at{' '}
          <a href="mailto:support@swiff.app" className="text-accent-blue hover:underline">
            support@swiff.app
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
