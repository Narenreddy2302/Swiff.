import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
// Import auth service based on environment
import * as supabaseAuth from '../../../services/api/supabaseAuthService';
import * as mockAuth from '../../../services/api/mockAuthService';

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
const authService = useMockAuth ? mockAuth : supabaseAuth;
const { signUpWithEmail, signInWithGoogle } = authService;
import { Button, Input } from '../../../components/common';

// Validation schema
const signupSchema = z
  .object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err.code === 'auth/email-already-in-use'
          ? 'This email is already registered'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Swiff</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border-l-4 border-status-danger p-4 rounded">
                <p className="text-sm text-status-danger">{error}</p>
              </div>
            )}

            {/* Name Input */}
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={!!errors.displayName}
              helperText={errors.displayName?.message}
              {...register('displayName')}
            />

            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password')}
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Submit Button */}
            <Button type="submit" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <Button
            variant="secondary"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </Button>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
