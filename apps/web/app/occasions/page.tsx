/**
 * Occasions Page
 *
 * Displays a list of occasions (holidays, birthdays, etc.) with filtering.
 * Supports upcoming/past filtering and date-sorted display.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOccasions } from '@/hooks/useOccasions';
import { PageHeader } from '@/components/layout';
import { Button, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { OccasionList } from '@/components/occasions';
import { PlusIcon } from '@/components/layout/icons';

type FilterType = 'upcoming' | 'past' | 'all';

export default function OccasionsPage() {
  const [filter, setFilter] = useState<FilterType>('upcoming');

  // Determine API filter params (undefined filter for 'all')
  const apiParams = filter === 'all' ? undefined : { filter };

  // Fetch occasions with current filter
  const { data, isLoading, error } = useOccasions(apiParams);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Occasions"
        subtitle="Holidays, birthdays, and special events"
        actions={
          <Link href="/occasions/new">
            <Button>
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Occasion
            </Button>
          </Link>
        }
      />

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-medium">Error loading occasions</p>
              <p className="text-red-500 text-sm mt-1">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
          )}

          {/* Success State */}
          {!isLoading && !error && data && (
            <OccasionList occasions={data.items} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
