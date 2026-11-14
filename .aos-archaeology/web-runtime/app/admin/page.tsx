'use client';

import { AdminPage } from '@/components/features/admin/AdminPage';

/**
 * Admin page route - renders the AdminPage component
 * Uses 'use client' since AdminPage contains interactive elements
 */
export default function AdminPageRoute() {
  return <AdminPage />;
}
