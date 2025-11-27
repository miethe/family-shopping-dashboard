'use client';

import { PageHeader } from '@/components/layout';
import { Skeleton } from '@/components/ui';
import {
  PrimaryOccasion,
  PipelineSummary,
  PeopleNeeding,
  QuickActions,
} from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="p-4">
        <PageHeader title="Dashboard" />
        <div className="text-red-600 p-4 bg-red-50 rounded-lg mt-4">
          Error loading dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back!" />

      {/* Quick Actions */}
      <QuickActions />

      {/* Primary Occasion */}
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : data?.primary_occasion ? (
        <PrimaryOccasion occasion={data.primary_occasion} />
      ) : (
        <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
          No upcoming occasions
        </div>
      )}

      {/* Pipeline Summary */}
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : (
        <PipelineSummary
          ideas={data?.total_ideas ?? 0}
          purchased={data?.total_purchased ?? 0}
          myAssignments={data?.my_assignments ?? 0}
        />
      )}

      {/* People Needing Gifts */}
      {isLoading ? (
        <Skeleton className="h-48" />
      ) : (
        <PeopleNeeding people={data?.people_needing_gifts ?? []} />
      )}
    </div>
  );
}
