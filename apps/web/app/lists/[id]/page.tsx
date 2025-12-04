/**
 * List Detail Page - Kanban/List View
 *
 * Displays a single gift list with view toggle between Kanban board and table view.
 * Features:
 * - Enhanced header with list type badge and summary stats
 * - Budget comparison if occasion has a budget
 * - View toggle (Board/List)
 * - Four-column Kanban board: Idea → To Buy → Purchased → Gifted
 * - Glassmorphism cards with large rounded corners
 * - Mobile-first responsive (horizontal scroll on mobile, columns on desktop)
 * - Drag-and-drop functionality with optimistic updates
 */

'use client';

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useList } from '@/hooks/useLists';
import { useListItems } from '@/hooks/useListItems';
import { useBudgetMeter } from '@/hooks/useBudgetMeter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Icon, IconNames } from '@/components/ui/icon';
import { KanbanView, TableView, AddListItemModal } from '@/components/lists';
import { GiftDetailModal } from '@/components/modals';
import { PageHeader } from '@/components/layout';
import {
  FilterIcon,
  ArrowUpDownIcon,
  PlusIcon,
  SparklesIcon,
} from '@/components/layout/icons';
import type { ListItemStatus, ListItemWithGift } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'list';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Loading skeleton for Kanban view
 */
function ListDetailSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ListNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="default" padding="lg" className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">List Not Found</h2>
        <p className="text-gray-500 mb-4">
          The list you are looking for does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/lists')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-gray-700 transition-colors min-h-[44px]"
        >
          Back to Lists
        </button>
      </Card>
    </div>
  );
}

export default function ListDetailPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const listId = parseInt(id, 10);

  // View and modal state
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<ListItemStatus>('idea');
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);

  // Fetch list data
  const { data: listData, isLoading: listLoading, error: listError } = useList(listId);

  // Fetch list items
  const { data: items, isLoading: itemsLoading } = useListItems(listId);

  // Fetch budget data if list has an occasion
  const { data: budgetData } = useBudgetMeter(listData?.occasion_id);

  // Handler for adding items with a specific status
  const handleAddItem = (status: ListItemStatus) => {
    setDefaultStatus(status);
    setIsAddItemModalOpen(true);
  };

  // Handler for clicking on an item (works for both table and kanban views)
  const handleItemClick = (item: ListItemWithGift) => {
    if (item.gift?.id) {
      setSelectedGiftId(item.gift.id);
    }
  };

  // Show loading state
  if (listLoading) {
    return <ListDetailSkeleton />;
  }

  // Show error state
  if (listError || !listData) {
    return <ListNotFound />;
  }

  // Calculate summary stats
  const itemCount = items?.length || 0;
  const purchasedCount = items?.filter(item => item.status === 'purchased' || item.status === 'received').length || 0;
  const totalEstimate = items?.reduce((sum, item) => sum + (item.gift?.price || 0), 0) || 0;

  // Format list type badge
  const listTypeBadge = listData.type === 'wishlist' ? 'Wish List' :
                        listData.type === 'ideas' ? 'Gift List' : 'Assigned List';

  // Mock updated time - in real app, calculate from updated_at
  const updatedAgo = '2h';

  // Budget display
  const hasBudget = budgetData?.has_budget && budgetData?.budget_total !== null;
  const budgetTotal = budgetData?.budget_total ?? 0;
  const isOverBudget = totalEstimate > budgetTotal && hasBudget;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background-dark dark:to-warm-900">
      <div className="max-w-7xl mx-auto h-full flex flex-col pb-20">
        {/* Enhanced Header Section */}
        <div className="px-4 md:px-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {listTypeBadge}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  Updated {updatedAgo} ago
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {listData.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-medium">
                <span>{itemCount} items</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span>{purchasedCount} purchased</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className={cn(
                  'font-semibold',
                  isOverBudget && 'text-red-600 dark:text-red-400'
                )}>
                  ${totalEstimate.toFixed(2)}
                  {hasBudget && (
                    <span className={cn(
                      'font-normal',
                      isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-slate-400'
                    )}>
                      {' / $'}{budgetTotal.toFixed(2)}
                    </span>
                  )}
                  {!hasBudget && ' est. total'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              {/* View Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all min-h-[44px]',
                    viewMode === 'kanban'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  <Icon name={IconNames.kanban} size="md" />
                  <span className="hidden sm:inline">Board</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all min-h-[44px]',
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  <Icon name={IconNames.table} size="md" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>

              {/* Add Gift Button */}
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-primary-600 transition shadow-lg shadow-slate-900/20 min-h-[44px]"
              >
                <Icon name={IconNames.add} size="md" />
                <span className="hidden sm:inline">Add Gift</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - View Toggle */}
        <div className="flex-1 overflow-hidden px-4 md:px-8 mt-6">
          {viewMode === 'kanban' ? (
            itemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            ) : (
              <KanbanView
                items={items || []}
                listId={listId}
                onAddItem={handleAddItem}
                onItemClick={handleItemClick}
              />
            )
          ) : itemsLoading ? (
            <div className="h-full bg-white dark:bg-slate-800/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Skeleton className="h-full" />
            </div>
          ) : (
            <TableView items={items || []} onItemClick={handleItemClick} />
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <AddListItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        listId={listId}
        defaultStatus={defaultStatus}
      />

      {/* Gift Detail Modal */}
      <GiftDetailModal
        giftId={selectedGiftId?.toString() ?? ''}
        open={!!selectedGiftId}
        onOpenChange={(open) => !open && setSelectedGiftId(null)}
      />
    </div>
  );
}
