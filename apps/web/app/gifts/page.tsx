'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGifts } from '@/hooks/useGifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Skeleton, Badge } from '@/components/ui';
import {
  GiftCard,
  GiftSearch,
  GiftFilters,
  AddGiftModal,
  type SortOption,
  type GiftFilterValues,
} from '@/components/gifts';

/**
 * Gifts Page
 *
 * Browse and search gift catalog with filtering and sorting.
 * Mobile-first responsive design with loading states.
 */
export default function GiftsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<GiftFilterValues>({
    person_ids: [],
    statuses: [],
    list_ids: [],
    occasion_ids: [],
  });

  const { data, isLoading, error, refetch } = useGifts({
    search: search || undefined,
    sort,
    person_ids: filters.person_ids.length > 0 ? filters.person_ids : undefined,
    statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
    list_ids: filters.list_ids.length > 0 ? filters.list_ids : undefined,
    occasion_ids: filters.occasion_ids.length > 0 ? filters.occasion_ids : undefined,
  });

  // Calculate active filter count for display
  const activeFilterCount =
    filters.person_ids.length +
    filters.statuses.length +
    filters.list_ids.length +
    filters.occasion_ids.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gift Catalog"
        subtitle="Browse and manage gift ideas"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>Add Gift</Button>
        }
      />

      <GiftSearch
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Filters */}
      <GiftFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading gifts</p>
          <p className="text-sm text-gray-500 mt-2">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      ) : !data?.items.length ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-2">No gifts found.</p>
          {search ? (
            <p className="text-sm mb-4">Try adjusting your search.</p>
          ) : (
            <p className="text-sm mb-4">Start building your gift catalog.</p>
          )}
          <Link href="/gifts/new">
            <Button>Add your first gift</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
        </div>
      )}

      <AddGiftModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
