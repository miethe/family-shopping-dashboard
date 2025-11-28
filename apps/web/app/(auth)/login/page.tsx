'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Client-side validation
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    try {
      await login(email.trim(), password);
      // AuthContext handles redirect to /dashboard on success
    } catch (err) {
      // Error is already set in AuthContext
      console.error('Login error:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Register Link */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Don&apos;t have an account? </span>
          <Link
            href="/register"
            className="text-primary-600 hover:text-primary-700 font-medium underline-offset-4 hover:underline min-h-[44px] inline-flex items-center"
          >
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}
