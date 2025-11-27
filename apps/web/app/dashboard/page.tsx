import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout';

export const metadata: Metadata = {
  title: 'Dashboard - Family Gifting Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to your gifting dashboard"
      />

      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* TODO: Implement dashboard overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600">Dashboard content will go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
