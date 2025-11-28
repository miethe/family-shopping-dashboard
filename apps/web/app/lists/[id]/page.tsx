/**
 * List Detail Page
 *
 * Displays a single gift list with pipeline view of items grouped by status.
 * Shows list header, summary stats, and items in Idea → Selected → Purchased → Received order.
 * Fetches data client-side using React Query hooks.
 */

'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useList } from '@/hooks/useLists';
import { useListItems } from '@/hooks/useListItems';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { ListDetail, PipelineView, ListSummary, AddListItemModal } from '@/components/lists';
import { PlusIcon } from '@/components/layout/icons';
import type { ListItemStatus } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Loading skeleton for list detail page
 */
function ListDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      </div>
      <div className="px-4 md:px-6">
        <Skeleton className="h-48 w-full mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ListNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Card variant="default" padding="lg" className="text-center max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">List Not Found</h2>
        <p className="text-gray-500 mb-4">
          The list you are looking for does not exist or has been deleted.
        </p>
        <Button asChild variant="outline">
          <Link href="/lists">Back to Lists</Link>
        </Button>
      </Card>
    </div>
  );
}

export default function ListDetailPage({ params }: Props) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader
        title={listData.name}
        backHref="/lists"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsAddItemModalOpen(true)}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <Button variant="outline" size="default">
              Edit
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="px-4 py-6 md:px-6 space-y-6 max-w-7xl mx-auto">
        {/* List Detail Card */}
        <ListDetail list={listData} />

        {/* Summary Stats */}
        {itemsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <ListSummary items={items || []} />
        )}

        {/* Pipeline View */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
          {itemsLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : (
            <PipelineView items={items || []} onAddItem={handleAddItem} />
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
    </div>
  );
}
