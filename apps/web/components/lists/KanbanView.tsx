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
 * Includes drag-and-drop functionality with optimistic updates.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { useUpdateListItemStatus } from '@/hooks/useListItems';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface KanbanViewProps {
  items: ListItemWithGift[];
  listId: number;
  onAddItem?: (status: ListItemStatus) => void;
  onItemClick?: (item: ListItemWithGift) => void;
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

export function KanbanView({ items, listId, onAddItem, onItemClick }: KanbanViewProps) {
  // Local state for optimistic updates
  const [optimisticItems, setOptimisticItems] = useState<ListItemWithGift[]>(items);
  const [draggedItem, setDraggedItem] = useState<ListItemWithGift | null>(null);

  // Update local state when items prop changes (from server)
  useEffect(() => {
    setOptimisticItems(items);
  }, [items]);

  // Mutation hook for updating item status
  const updateStatusMutation = useUpdateListItemStatus(listId);

  // Group items by status
  const groupedItems = groupItemsForKanban(optimisticItems);

  /**
   * Handle drag start - store the dragged item
   */
  const handleDragStart = useCallback((item: ListItemWithGift) => {
    setDraggedItem(item);
  }, []);

  /**
   * Handle drag end - clear the dragged item
   */
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  /**
   * Handle drop - update item status with optimistic update
   */
  const handleDrop = useCallback(
    (targetStatus: ListItemStatus) => {
      if (!draggedItem) return;

      // Don't do anything if dropped in the same column
      if (draggedItem.status === targetStatus) {
        setDraggedItem(null);
        return;
      }

      const previousStatus = draggedItem.status;
      const itemId = draggedItem.id;

      // Optimistic update: Update UI immediately
      setOptimisticItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status: targetStatus } : item
        )
      );

      // API call to persist the change
      updateStatusMutation.mutate(
        { itemId, status: targetStatus },
        {
          onError: (error) => {
            // Rollback on error: revert to previous status
            console.error('Failed to update item status:', error);
            setOptimisticItems((prevItems) =>
              prevItems.map((item) =>
                item.id === itemId ? { ...item, status: previousStatus } : item
              )
            );
          },
          onSuccess: () => {
            // Success: the optimistic update is already applied
            console.log('Item status updated successfully');
          },
        }
      );

      setDraggedItem(null);
    },
    [draggedItem, updateStatusMutation]
  );

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-4 snap-x md:grid md:grid-cols-4 md:overflow-visible">
      {kanbanColumns.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          items={groupedItems[status]}
          onAddItem={onAddItem}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          isDragOver={draggedItem !== null && draggedItem.status !== status}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}
