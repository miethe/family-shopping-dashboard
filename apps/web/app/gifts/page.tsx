'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGifts } from '@/hooks/useGifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Skeleton } from '@/components/ui';
import { GiftCard, GiftSearch, type SortOption } from '@/components/gifts';

/**
 * Gifts Page
 *
 * Browse and search gift catalog with filtering and sorting.
 * Mobile-first responsive design with loading states.
 */
export default function GiftsPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');

  const { data, isLoading, error } = useGifts({
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gift Catalog"
        subtitle="Browse and manage gift ideas"
        actions={
          <Link href="/gifts/new">
            <Button>Add Gift</Button>
          </Link>
        }
      />

      <GiftSearch
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

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
    </div>
  );
}
