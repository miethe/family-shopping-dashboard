'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePersons } from '@/hooks/usePersons';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PersonList, PersonSearch } from '@/components/people';
import type { Person } from '@/types';

/**
 * People List Page
 *
 * Displays paginated list of family members with:
 * - Search/filter functionality (client-side for V1)
 * - Card grid (responsive: 1/2/3 columns)
 * - Loading skeletons
 * - Empty state
 * - Pagination with "Load More" button
 * - Add Person action button
 */
export default function PeoplePage() {
  const [cursor, setCursor] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = usePersons({ cursor });

  // Client-side search filtering
  const filteredPeople = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery.trim()) return data.items;

    const query = searchQuery.toLowerCase();
    return data.items.filter((person: Person) => {
      return (
        person.name.toLowerCase().includes(query) ||
        person.interests?.some(interest => interest.toLowerCase().includes(query))
      );
    });
  }, [data?.items, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="People"
        subtitle="Family members and gift recipients"
        actions={
          <Link href="/people/new">
            <Button>Add Person</Button>
          </Link>
        }
      />

      {/* Search Bar */}
      <PersonSearch onSearch={setSearchQuery} />

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">Error loading people</p>
          <p className="text-gray-500 text-sm mt-2">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      ) : (
        <>
          {/* Person List */}
          <PersonList people={filteredPeople} />

          {/* Load More Button */}
          {data?.has_more && !searchQuery && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setCursor(data.next_cursor ?? undefined)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
