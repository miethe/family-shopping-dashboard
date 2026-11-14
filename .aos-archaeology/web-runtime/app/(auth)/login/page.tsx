'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

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
    <div className="flex items-center justify-center min-h-[100dvh] bg-background-light p-6 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl w-full z-10 fade-in">

        {/* Left Column - Illustration Side (Hidden on Mobile) */}
        <div className="hidden md:flex justify-center relative">
          <div className="relative w-full aspect-square max-w-md">
            {/* Placeholder illustration with gradient overlay */}
            <div
              className="w-full h-full bg-gradient-to-br from-primary-100 via-primary-50 to-sage/20 rounded-[2rem] drop-shadow-2xl transition-transform duration-500 hover:scale-105 flex items-center justify-center"
            >
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent rounded-[2rem]"></div>

              {/* Placeholder for illustration - could be an SVG or image */}
              <div className="relative z-10 text-center p-8">
                <span className="material-symbols-outlined text-[8rem] text-primary-500/30">
                  redeem
                </span>
              </div>
            </div>

            {/* Floating animated elements */}
            <div
              className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-soft animate-bounce"
              style={{ animationDuration: '3s' }}
            >
              <span className="material-symbols-outlined text-4xl text-primary">card_giftcard</span>
            </div>
            <div
              className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-soft animate-bounce"
              style={{ animationDuration: '4s' }}
            >
              <span className="material-symbols-outlined text-4xl text-sage">celebration</span>
            </div>
          </div>
        </div>

        {/* Right Column - Form Side */}
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Welcome to <span className="text-primary">Family Gifting</span>
            </h1>
            <p className="text-slate-500 text-lg">Log in to continue managing your gifts and lists.</p>
          </div>

          {/* Glassmorphic Form Card */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-soft hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-8">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ACCESSIBILITY FIX: Changed from aria-live="assertive" to role="alert" */}
              {/* Global Error Message */}
              {displayError && (
                <div
                  className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm"
                  role="alert"
                >
                  {displayError}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 ml-1" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none min-h-[44px]"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                  autoFocus
                  aria-describedby={displayError ? 'login-error' : undefined}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2 ml-1" htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full px-5 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none min-h-[44px]"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  aria-describedby={displayError ? 'login-error' : undefined}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg shadow-primary/30 hover:bg-primary-600 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-h-[44px]"
                  aria-busy={loading}
                >
                  {loading ? 'Signing in...' : 'Log In'}
                </button>
              </div>
            </form>
          </div>

          {/* Register Link */}
          <div className="text-center mt-8">
            <p className="text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline ml-1 min-h-[44px] inline-flex items-center"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
