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
    <div className="fg-theme min-h-[100dvh] bg-[#f5f1e8] p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        <div className="bg-[#214d40] text-[#f5f1e8] px-5 pt-[18px] pb-[22px] sm:px-[25px] sm:pt-[30px] sm:pb-[38px] relative overflow-hidden rounded-[24px_24px_42%_8%/24px_24px_28px_18px]">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.19em]">Gather &amp; give</p>
          <h1 className="text-[1.9rem] sm:text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.08] mt-3 text-[#f5f1e8]" style={{ fontFamily: 'Georgia, serif' }}>Create Account</h1>
          <p className="mt-2 text-[#eee6d7] max-w-[78%]">Sign up to start planning gifts together.</p>
          <span className="absolute right-5 bottom-3 text-[#ddbea9] text-5xl rotate-[15deg]" aria-hidden="true">✦</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#fffdf8] border border-[#d1c8bc] rounded-[18px] p-6">
          {displayError && (
            <div
              className="p-3 rounded-[10px] bg-[#f9e9e5] border border-[#d9a99d] text-[#7a2b1d] text-sm"
              role="alert"
              aria-live="assertive"
            >
              {displayError}
            </div>
          )}

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

          <Button
            type="submit"
            className="w-full rounded-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#635a50]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#91462d] font-semibold underline underline-offset-4 min-h-[44px] inline-flex items-center ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
