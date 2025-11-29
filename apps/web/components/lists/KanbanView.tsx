/**
 * KanbanView Component
 *
 * Kanban board layout displaying items in three columns:
 * - Idea (mustard)
 * - Shortlisted (coral)
 * - Purchased (sage)
 *
 * Responsive: stacked on mobile, columns on desktop (md+).
 * Maps existing statuses to columns appropriately.
 */

'use client';

import { KanbanColumn } from './KanbanColumn';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface KanbanViewProps {
  items: ListItemWithGift[];
  onAddItem?: (status: ListItemStatus) => void;
}

// Define the three columns we want to show
const kanbanColumns: ListItemStatus[] = ['idea', 'selected', 'purchased'];

/**
 * Group items by status and map 'received' to 'purchased' column
 */
function groupItemsForKanban(items: ListItemWithGift[]): Record<ListItemStatus, ListItemWithGift[]> {
  const grouped: Record<ListItemStatus, ListItemWithGift[]> = {
    idea: [],
    selected: [],
    purchased: [],
    received: [], // Not displayed as separate column
  };

  items.forEach((item) => {
    // Map 'received' status to 'purchased' column
    if (item.status === 'received') {
      grouped.purchased.push(item);
    } else {
      grouped[item.status].push(item);
    }
  });

  return grouped;
}

export function KanbanView({ items, onAddItem }: KanbanViewProps) {
  // Group items by status
  const groupedItems = groupItemsForKanban(items);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
