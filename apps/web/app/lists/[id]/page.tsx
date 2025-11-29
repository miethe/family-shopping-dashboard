/**
 * List Detail Page - Kanban Style
 *
 * Displays a single gift list with Kanban board layout inspired by SingleListView design.
 * Features:
 * - Clean header with back button, list title, and action buttons
 * - Three-column Kanban board: Idea → Shortlisted → Purchased
 * - Glassmorphism cards with large rounded corners
 * - Mobile-first responsive (stacked on mobile, columns on desktop)
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useList } from '@/hooks/useLists';
import { useListItems } from '@/hooks/useListItems';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { KanbanView, AddListItemModal } from '@/components/lists';
import {
  FilterIcon,
  ArrowUpDownIcon,
  PlusIcon,
  SparklesIcon,
} from '@/components/layout/icons';
import type { ListItemStatus } from '@/types';

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

  // Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<ListItemStatus>('idea');

  // Fetch list data
  const { data: listData, isLoading: listLoading, error: listError } = useList(listId);

  // Fetch list items
  const { data: items, isLoading: itemsLoading } = useListItems(listId);

  // Handler for adding items with a specific status
  const handleAddItem = (status: ListItemStatus) => {
    setDefaultStatus(status);
    setIsAddItemModalOpen(true);
  };

  // Show loading state
  if (listLoading) {
    return <ListDetailSkeleton />;
  }

  // Show error state
  if (listError || !listData) {
    return <ListNotFound />;
  }

  // Calculate item count
  const itemCount = items?.length || 0;
  const newItemsCount = 0; // TODO: Add logic for "new" items if needed

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button
              onClick={() => router.push('/lists')}
              className="text-gray-400 hover:text-[#E07A5F] font-bold text-sm mb-2 transition-colors min-h-[44px]"
            >
              &larr; Back to Lists
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#3D405B]">
              {listData.name}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
              {newItemsCount > 0 && ` · ${newItemsCount} new`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100 min-h-[44px]">
              <FilterIcon className="w-[18px] h-[18px]" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-bold shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100 min-h-[44px]">
              <ArrowUpDownIcon className="w-[18px] h-[18px]" /> Sort
            </button>

            {/* AI Button - disabled for now, can be enabled later */}
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all opacity-50 cursor-not-allowed min-h-[44px]"
              title="AI Ideas - Coming Soon"
            >
              <SparklesIcon className="w-[18px] h-[18px]" /> AI Ideas
            </button>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 bg-[#E07A5F] text-white rounded-full font-bold shadow-lg shadow-[#E07A5F]/30 hover:bg-[#d66f56] transition-all min-h-[44px]"
            >
              <PlusIcon className="w-[18px] h-[18px]" /> Add Gift
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : (
          <KanbanView items={items || []} onAddItem={handleAddItem} />
        )}
      </div>

      {/* Add Item Modal */}
      <AddListItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        listId={listId}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
