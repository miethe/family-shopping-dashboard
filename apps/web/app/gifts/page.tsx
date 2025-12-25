'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGifts } from '@/hooks/useGifts';
import { usePersons } from '@/hooks/usePersons';
import { useGiftSelection } from '@/hooks/useGiftSelection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Skeleton } from '@/components/ui';
import {
  GiftCard,
  GiftToolbar,
  GiftGroupedView,
  AddGiftModal,
  BulkActionBar,
  SelectAllButton,
  type SortOption,
  type GiftFilterValues,
  type GroupOption,
} from '@/components/gifts';
import { GiftDetailModal, useEntityModal } from '@/components/modals';
import type { LinkedPerson, LinkedList } from '@/components/gifts/LinkedEntityIcons';
import type { Gift, GiftStatus } from '@/types';
import { X } from '@/components/ui/icons';

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
 * Includes bulk selection mode with checkbox UI.
 *
 * TASK-1.5: Updated to map gift_people and list_items data to GiftCard props
 * TASK-3.4: Added filter callbacks that update URL query params
 */
function GiftsPageContent({ onOpenDetail }: GiftsPageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Selection mode hook
  const selection = useGiftSelection();

  // Initialize filters from URL query params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const personIdsParam = searchParams.getAll('person_id').map(Number);
    const listIdParam = searchParams.get('list_id');

    setFilters((prev) => ({
      ...prev,
      statuses: statusParam ? [statusParam] : [],
      person_ids: personIdsParam.length > 0 ? personIdsParam : [],
      list_ids: listIdParam ? [Number(listIdParam)] : [],
    }));
  }, [searchParams]);

  const { data, isLoading, error, refetch } = useGifts({
    search: search || undefined,
    sort,
    person_ids: filters.person_ids.length > 0 ? filters.person_ids : undefined,
    statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
    list_ids: filters.list_ids.length > 0 ? filters.list_ids : undefined,
    occasion_ids: filters.occasion_ids.length > 0 ? filters.occasion_ids : undefined,
  });

  // Fetch all persons for name resolution
  const { data: personsData } = usePersons();

  // Create person lookup map for efficient name resolution
  const personMap = useMemo(() => {
    if (!personsData?.items) return new Map();
    return new Map(
      personsData.items.map((person) => [person.id, person])
    );
  }, [personsData]);

  /**
   * Maps gift data to include recipients and lists for GiftCard
   * Uses API's gift_people and list_items data
   */
  const mapGiftForCard = (gift: Gift) => {
    // Map gift_people to LinkedPerson format for LinkedEntityIcons
    const recipients: LinkedPerson[] = gift.gift_people
      ?.filter((gp) => gp.role === 'recipient')
      .map((gp) => {
        const person = personMap.get(gp.person_id);
        return {
          id: gp.person_id,
          display_name: person?.display_name || `Person ${gp.person_id}`,
          photo_url: person?.photo_url,
        };
      }) || [];

    // Map list_items to LinkedList format for LinkedEntityIcons
    const lists: LinkedList[] = gift.list_items?.map((li) => ({
      id: li.list_id,
      name: li.list_name,
    })) || [];

    return {
      ...gift,
      recipients,
      lists,
      list_items: gift.list_items,
    };
  };

  /**
   * TASK-3.4: Filter handler - toggles status filter via URL params
   */
  const handleStatusFilter = useCallback((status: GiftStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('status') === status) {
      params.delete('status'); // Toggle off if already active
    } else {
      params.set('status', status);
    }
    router.push(`/gifts?${params.toString()}`);
  }, [searchParams, router]);

  /**
   * TASK-3.4: Filter handler - toggles recipient filter via URL params
   * Supports multi-select (OR logic)
   */
  const handleRecipientFilter = useCallback((personId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    const personIds = params.getAll('person_id');

    if (personIds.includes(String(personId))) {
      // Remove from filter
      params.delete('person_id');
      personIds
        .filter(id => id !== String(personId))
        .forEach(id => params.append('person_id', id));
    } else {
      // Add to filter
      params.append('person_id', String(personId));
    }
    router.push(`/gifts?${params.toString()}`);
  }, [searchParams, router]);

  /**
   * TASK-3.4: Filter handler - toggles list filter via URL params
   * Single-select (exclusive)
   */
  const handleListFilter = useCallback((listId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('list_id') === String(listId)) {
      params.delete('list_id'); // Toggle off if already active
    } else {
      params.set('list_id', String(listId)); // Replace (exclusive)
    }
    router.push(`/gifts?${params.toString()}`);
  }, [searchParams, router]);

  /**
   * TASK-3.4: Clear all active filters
   */
  const clearAllFilters = useCallback(() => {
    router.push('/gifts');
  }, [router]);

  /**
   * TASK-2.5: Handler for selecting all gifts in a group
   * Merges current selections with new IDs (additive)
   */
  const handleSelectMultiple = useCallback((ids: number[]) => {
    // Merge current selections with new IDs
    const currentIds = Array.from(selection.selectedIds);
    const newIds = [...new Set([...currentIds, ...ids])];
    selection.selectAll(newIds);
  }, [selection]);

  /**
   * TASK-2.5: Handler for deselecting all gifts in a group
   * Removes specified IDs from current selection
   */
  const handleDeselectMultiple = useCallback((ids: number[]) => {
    // Remove specified IDs from current selection
    const idsToRemove = new Set(ids);
    const remainingIds = Array.from(selection.selectedIds).filter(id => !idsToRemove.has(id));
    selection.selectAll(remainingIds);
  }, [selection]);

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Gift Catalog"
        subtitle="Browse and manage gift ideas"
        actions={
          <div className="flex gap-2">
            {/* Selection Mode Toggle */}
            <Button
              variant={selection.isSelectionMode ? 'outline' : 'ghost'}
              onClick={selection.toggleSelectionMode}
            >
              {selection.isSelectionMode ? 'Cancel' : 'Select'}
            </Button>
            {/* Add Gift Button */}
            <Button onClick={() => setIsAddModalOpen(true)}>Add Gift</Button>
          </div>
        }
      />

      {/* Bulk Action Bar - shows when items are selected */}
      {selection.isSelectionMode && selection.selectedIds.size > 0 && (
        <BulkActionBar
          selectedIds={selection.selectedIds}
          onClear={selection.clearSelection}
          onActionComplete={() => refetch()}
        />
      )}

      {/* TASK-3.4: Active Filters Bar - shows when any filters are active */}
      {(filters.statuses.length > 0 || filters.person_ids.length > 0 || filters.list_ids.length > 0) && (
        <div className="flex flex-wrap gap-2 items-center p-3 bg-warm-50 rounded-large border border-warm-200">
          <span className="text-sm font-medium text-warm-600">Active filters:</span>

          {/* Status Filter Badge */}
          {filters.statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status as GiftStatus)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-medium hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 min-h-[32px]"
              aria-label={`Remove status filter: ${status}`}
            >
              <span className="font-medium">Status: {status}</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {/* Recipient Filter Badges */}
          {filters.person_ids.map((personId) => {
            const person = personMap.get(personId);
            return (
              <button
                key={personId}
                onClick={() => handleRecipientFilter(personId)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-secondary-100 text-secondary-700 rounded-medium hover:bg-secondary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-1 min-h-[32px]"
                aria-label={`Remove recipient filter: ${person?.display_name || `Person ${personId}`}`}
              >
                <span className="font-medium">
                  Recipient: {person?.display_name || `Person ${personId}`}
                </span>
                <X className="w-3 h-3" />
              </button>
            );
          })}

          {/* List Filter Badge */}
          {filters.list_ids.map((listId) => (
            <button
              key={listId}
              onClick={() => handleListFilter(listId)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-accent-100 text-accent-700 rounded-medium hover:bg-accent-200 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 min-h-[32px]"
              aria-label={`Remove list filter: ${listId}`}
            >
              <span className="font-medium">List: {listId}</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {/* Clear All Button */}
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs text-warm-500 hover:text-warm-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded px-2 py-1 min-h-[32px]"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        </div>
      )}

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

      {/* Select All Button - appears in selection mode */}
      <SelectAllButton
        isSelectionMode={selection.isSelectionMode}
        selectedCount={selection.selectedIds.size}
        totalCount={data?.items?.length || 0}
        onSelectAll={() => selection.selectAll(data?.items?.map(g => g.id) || [])}
        onDeselectAll={selection.clearSelection}
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
          {data.items.map((gift) => {
            const mappedGift = mapGiftForCard(gift);
            return (
              <GiftCard
                key={gift.id}
                gift={mappedGift}
                onOpenDetail={onOpenDetail}
                selectionMode={selection.isSelectionMode}
                isSelected={selection.isSelected(gift.id)}
                onToggleSelection={() => selection.toggleSelection(gift.id)}
                onStatusFilter={handleStatusFilter}
                onRecipientClick={handleRecipientFilter}
                onListClick={handleListFilter}
              />
            );
          })}
        </div>
      ) : (
        <GiftGroupedView
          gifts={data.items}
          groupBy={groupBy}
          emptyMessage="No gifts match your search."
          onOpenDetail={onOpenDetail}
          selectionMode={selection.isSelectionMode}
          isSelected={selection.isSelected}
          onToggleSelection={selection.toggleSelection}
          selectedIds={selection.selectedIds}
          onSelectMultiple={handleSelectMultiple}
          onDeselectMultiple={handleDeselectMultiple}
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
