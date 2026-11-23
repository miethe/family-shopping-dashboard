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

  const fieldClass =
    'w-full px-4 py-3 bg-white border border-[rgb(var(--line))] rounded-[10px] text-base text-[rgb(var(--ink))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/25 min-h-[44px]';
  const labelClass = 'block mb-2 text-xs font-semibold text-[rgb(var(--ink))] uppercase tracking-wide';

  return (
    <div className="fg-theme min-h-[100dvh] bg-[rgb(var(--paper))] p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        {/* Hero, same banner as the Events screens */}
        <div className="bg-[rgb(var(--accent))] text-[rgb(var(--paper))] px-5 pt-[18px] pb-[22px] sm:px-[25px] sm:pt-[30px] sm:pb-[38px] relative overflow-hidden rounded-[28px]">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.19em]">Gather &amp; give</p>
          <h1 className="text-[1.9rem] sm:text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.08] mt-3 text-[rgb(var(--paper))]" style={{ fontFamily: 'var(--font-family-display)' }}>Family Gifting</h1>
          <p className="mt-2 text-[rgb(var(--white))] max-w-[78%]">Sign in to keep your gift plans together.</p>
        </div>

        <div className="bg-[rgb(var(--white))] border border-[rgb(var(--line))] rounded-[26px] p-6">
          <h2 className="text-2xl font-bold mb-5 text-[rgb(var(--ink))]">Log in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="p-3 rounded-[10px] bg-[rgb(var(--pink))] border border-[rgb(var(--cranberry))] text-[rgb(var(--cranberry))] text-sm" role="alert">
                {displayError}
              </div>
            )}

            <div>
              <label className={labelClass} htmlFor="email">Email</label>
              <input
                className={fieldClass}
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
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="password">Password</label>
              <input
                className={fieldClass}
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgb(var(--accent))] text-[rgb(var(--paper))] font-semibold py-3 rounded-full hover:bg-[rgb(var(--accent))] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] transition-colors"
              aria-busy={loading}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[rgb(var(--muted))]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-[rgb(var(--accent))] underline underline-offset-4 min-h-[44px] inline-flex items-center ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
