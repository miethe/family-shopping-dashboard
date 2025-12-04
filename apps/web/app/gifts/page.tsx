'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGifts } from '@/hooks/useGifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Skeleton } from '@/components/ui';
import {
  GiftCard,
  GiftToolbar,
  GiftGroupedView,
  AddGiftModal,
  type SortOption,
  type GiftFilterValues,
  type GroupOption,
} from '@/components/gifts';
import { GiftDetailModal, useEntityModal } from '@/components/modals';

/**
 * Loading skeleton for the Gifts page
 * Matches the page structure with toolbar and grid layout
 */
function GiftsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Toolbar skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface GiftsPageContentProps {
  onOpenDetail: (id: string) => void;
}

/**
 * Gifts Page Content
 *
 * Browse and search gift catalog with filtering and sorting.
 * Mobile-first responsive design with loading states.
 * Supports URL query params for initial filter state (e.g., ?status=idea)
 */
function GiftsPageContent({ onOpenDetail }: GiftsPageContentProps) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [groupBy, setGroupBy] = useState<GroupOption>('none');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState<GiftFilterValues>({
    person_ids: [],
    statuses: [],
    list_ids: [],
    occasion_ids: [],
  });

  // Initialize filters from URL query params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setFilters((prev) => ({
        ...prev,
        statuses: [statusParam],
      }));
    }
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useGifts({
    search: search || undefined,
    sort,
    person_ids: filters.person_ids.length > 0 ? filters.person_ids : undefined,
    statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
    list_ids: filters.list_ids.length > 0 ? filters.list_ids : undefined,
    occasion_ids: filters.occasion_ids.length > 0 ? filters.occasion_ids : undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gift Catalog"
        subtitle="Browse and manage gift ideas"
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>Add Gift</Button>
        }
      />

      <GiftToolbar
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
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
      ) : groupBy === 'none' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      ) : (
        <GiftGroupedView
          gifts={data.items}
          groupBy={groupBy}
          emptyMessage="No gifts match your search."
          onOpenDetail={onOpenDetail}
        />
      )}

      <AddGiftModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

/**
 * Gifts Page
 *
 * Wraps GiftsPageContent in Suspense boundary to prevent hydration issues
 * with useSearchParams() in Next.js 15.
 *
 * Modal state is managed at this level (outside Suspense) to prevent crashes
 * during navigation when the Suspense boundary unmounts while modal cleanup is in progress.
 */
export default function GiftsPage() {
  // Centralized gift detail modal state - kept outside Suspense to prevent race conditions
  const { open: detailOpen, entityId: detailGiftId, openModal: openDetail, closeModal: closeDetail } = useEntityModal('gift');

  return (
    <>
      <Suspense fallback={<GiftsSkeleton />}>
        <GiftsPageContent onOpenDetail={openDetail} />
      </Suspense>

      {/* Modal rendered outside Suspense boundary - prevents unmount race condition during navigation */}
      <GiftDetailModal
        giftId={detailGiftId}
        open={detailOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDetail();
        }}
      />
    </>
  );
}
