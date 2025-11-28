/**
 * PipelineView Component
 *
 * Full pipeline showing all status groups in order: Idea → Selected → Purchased → Received.
 * Groups items by status and displays each group in sequence.
 * Mobile-first responsive layout with proper spacing.
 */

'use client';

import { ListItemGroup } from './ListItemGroup';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface PipelineViewProps {
  items: ListItemWithGift[];
  onItemStatusChange?: (itemId: number, newStatus: ListItemStatus) => void;
  onAddItem?: (status: ListItemStatus) => void;
}

// Status order for pipeline
const statusOrder: ListItemStatus[] = ['idea', 'selected', 'purchased', 'received'];

/**
 * Group items by status
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function PipelineView({ items, onItemStatusChange, onAddItem }: PipelineViewProps) {
  // Group items by status
  const groupedItems = groupBy(items, 'status');

  return (
    <div className="space-y-6">
      {statusOrder.map((status) => (
        <ListItemGroup
          key={status}
          status={status}
          items={groupedItems[status] || []}
          onItemStatusChange={onItemStatusChange}
          onAddItem={onAddItem}
        />
      ))}
    </div>
  );
}
