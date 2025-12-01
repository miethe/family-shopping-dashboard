/**
 * KanbanView Component
 *
 * Kanban board layout displaying items in four columns:
 * - Idea (yellow)
 * - To Buy (red)
 * - Purchased (green/teal)
 * - Gifted (purple)
 *
 * Responsive: horizontal scroll on mobile, grid on desktop.
 * Includes empty column placeholders with dashed borders.
 */

'use client';

import { KanbanColumn } from './KanbanColumn';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface KanbanViewProps {
  items: ListItemWithGift[];
  onAddItem?: (status: ListItemStatus) => void;
}

// Define the four columns for the Kanban board
const kanbanColumns: ListItemStatus[] = ['idea', 'to_buy', 'purchased', 'gifted'];

/**
 * Group items by status for Kanban display
 */
function groupItemsForKanban(items: ListItemWithGift[]): Record<ListItemStatus, ListItemWithGift[]> {
  const grouped: Record<ListItemStatus, ListItemWithGift[]> = {
    idea: [],
    to_buy: [],
    purchased: [],
    gifted: [],
    selected: [],
    received: [],
  };

  items.forEach((item) => {
    // Map legacy statuses to new columns if needed
    if (item.status === 'selected') {
      grouped.to_buy.push(item);
    } else if (item.status === 'received') {
      grouped.gifted.push(item);
    } else if (grouped[item.status]) {
      grouped[item.status].push(item);
    }
  });

  return grouped;
}

export function KanbanView({ items, onAddItem }: KanbanViewProps) {
  // Group items by status
  const groupedItems = groupItemsForKanban(items);

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 snap-x md:grid md:grid-cols-4 md:overflow-visible">
      {kanbanColumns.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          items={groupedItems[status]}
          onAddItem={onAddItem}
        />
      ))}
    </div>
  );
}
