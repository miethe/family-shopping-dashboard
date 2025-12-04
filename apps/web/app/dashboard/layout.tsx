import { AppLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Dashboard layout with authentication protection and app shell
 * All routes under /dashboard will use this layout
 */
export default function DashboardLayout({
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
