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
      <div className="p-4 animate-fade-in">
        <PageHeader title="Dashboard" />
        <div className="text-red-600 p-4 bg-red-50 rounded-lg mt-4 border border-red-100">
          Error loading dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <PageHeader title="Dashboard" subtitle="Welcome back!" />
      </div>

      {/* Quick Actions */}
      <div>
        <QuickActions />
      </div>

      {/* Primary Occasion */}
      <div>
        {isLoading ? (
          <Skeleton className="h-32 rounded-xlarge" />
        ) : data?.primary_occasion ? (
          <PrimaryOccasion occasion={data.primary_occasion} />
        ) : (
          <div className="text-warm-500 text-center py-8 bg-surface-secondary/50 rounded-xlarge border border-dashed border-warm-200">
            No upcoming occasions
          </div>
        )}
      </div>

      {/* Pipeline Summary */}
      <div>
        {isLoading ? (
          <Skeleton className="h-24 rounded-xlarge" />
        ) : (
          <PipelineSummary
            ideas={data?.total_ideas ?? 0}
            purchased={data?.total_purchased ?? 0}
            myAssignments={data?.my_assignments ?? 0}
          />
        )}
      </div>

      {/* People Needing Gifts */}
      <div>
        {isLoading ? (
          <Skeleton className="h-48 rounded-xlarge" />
        ) : (
          <PeopleNeeding people={data?.people_needing_gifts ?? []} />
        )}
      </div>
    </div>
  );
}
