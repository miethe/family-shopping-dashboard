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
    'w-full px-4 py-3 bg-white border border-[#bdb3a6] rounded-[10px] text-base text-[#2b2622] placeholder:text-[#9e9285] focus:outline-none focus:border-[#214d40] focus:ring-2 focus:ring-[#214d40]/25 min-h-[44px]';
  const labelClass = 'block mb-2 text-xs font-semibold text-[#474039] uppercase tracking-wide';

  return (
    <div className="fg-theme min-h-[100dvh] bg-[#f5f1e8] p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        {/* Hero, same banner as the Events screens */}
        <div className="bg-[#214d40] text-[#f5f1e8] px-5 pt-[18px] pb-[22px] sm:px-[25px] sm:pt-[30px] sm:pb-[38px] relative overflow-hidden rounded-[24px_24px_42%_8%/24px_24px_28px_18px]">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.19em]">Gather &amp; give</p>
          <h1 className="text-[1.9rem] sm:text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.08] mt-3 text-[#f5f1e8]" style={{ fontFamily: 'Georgia, serif' }}>Family Gifting</h1>
          <p className="mt-2 text-[#eee6d7] max-w-[78%]">Sign in to keep your gift plans together.</p>
          <span className="absolute right-5 bottom-3 text-[#ddbea9] text-5xl rotate-[15deg]" aria-hidden="true">✦</span>
        </div>

        <div className="bg-[#fffdf8] border border-[#d1c8bc] rounded-[18px] p-6">
          <h2 className="text-2xl font-bold mb-5 text-[#2b2622]">Log in</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="p-3 rounded-[10px] bg-[#f9e9e5] border border-[#d9a99d] text-[#7a2b1d] text-sm" role="alert">
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
              className="w-full bg-[#214d40] text-[#f5f1e8] font-semibold py-3 rounded-full hover:bg-[#1a3d33] disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] transition-colors"
              aria-busy={loading}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#635a50]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-[#91462d] underline underline-offset-4 min-h-[44px] inline-flex items-center ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
