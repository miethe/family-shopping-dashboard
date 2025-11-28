'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    if (!confirmPassword) {
      setValidationError('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      await register(email.trim(), password);
      // AuthContext handles redirect to /dashboard on success
    } catch (err) {
      // Error is already set in AuthContext
      console.error('Registration error:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Sign up to start managing your gift lists</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Global Error Message */}
          {displayError && (
            <div
              className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {displayError}
            </div>
          )}

          {/* Email Field */}
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            autoFocus
          />

          {/* Password Field */}
          <Input
            type="password"
            label="Password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
          />

          {/* Confirm Password Field */}
          <Input
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium underline-offset-4 hover:underline min-h-[44px] inline-flex items-center"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
