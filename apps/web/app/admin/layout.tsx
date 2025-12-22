import { AppLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Field Options Management',
  description: 'Manage dropdown options for all entities',
};

/**
 * Admin layout with authentication protection and app shell
 * All routes under /admin will use this layout
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
