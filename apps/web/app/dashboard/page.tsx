'use client';

import { Skeleton } from '@/components/ui';
import {
  DashboardHeader,
  StatsCards,
  RecentActivity,
  IdeaInbox,
} from '@/components/dashboard';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="min-h-screen p-4 animate-fade-in">
        <div className="text-red-600 p-4 bg-red-50 rounded-2xlarge mt-4 border border-red-100">
          Error loading dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-6 relative overflow-x-hidden overflow-y-auto">
      {/* Decorative Background Blobs - Reduced size on mobile */}
      <div className="absolute top-20 right-10 w-64 h-64 md:w-96 md:h-96 bg-salmon/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 left-10 w-56 h-56 md:w-80 md:h-80 bg-sage/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 md:w-64 md:h-64 bg-mustard/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
        {/* Header with Occasion and People Carousel */}
        <div className="mb-10">
          {isLoading ? (
            <Skeleton className="h-24 rounded-2xlarge" />
          ) : (
            <DashboardHeader
              occasion={data?.primary_occasion}
              people={data?.people_needing_gifts ?? []}
            />
          )}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column: Stats & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            {/* Stats Row */}
            {isLoading ? (
              <Skeleton className="h-32 rounded-2xlarge" />
            ) : (
              <StatsCards
                ideas={data?.total_ideas ?? 0}
                toBuy={data?.my_assignments ?? 0}
                purchased={data?.total_purchased ?? 0}
                occasionId={data?.primary_occasion?.id}
              />
            )}

            {/* Idea Inbox */}
            <div className="flex-1">
              <IdeaInbox />
            </div>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="lg:col-span-7">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
