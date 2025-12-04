'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Public route component (login/register pages)
 * Redirects authenticated users to dashboard
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
