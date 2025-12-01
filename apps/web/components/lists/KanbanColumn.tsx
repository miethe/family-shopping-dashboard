/**
 * KanbanColumn Component
 *
 * Displays a column in the Kanban board with v2 design colors and styling.
 * Four status columns: Idea → To Buy → Purchased → Gifted
 * Includes count badges and empty state placeholders.
 */

'use client';

import { cn } from '@/lib/utils';
import type { ListItemWithGift, ListItemStatus } from '@/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: ListItemStatus;
  items: ListItemWithGift[];
  onAddItem?: (status: ListItemStatus) => void;
}

// Column headers and colors mapping (v2 design)
const columnConfig: Record<
  ListItemStatus,
  { title: string; bgColor: string; textColor: string }
> = {
  idea: {
    title: 'Idea',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  to_buy: {
    title: 'To Buy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  purchased: {
    title: 'Purchased',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  gifted: {
    title: 'Gifted',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  // Legacy statuses for backward compatibility
  selected: {
    title: 'Shortlisted',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  received: {
    title: 'Received',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
};

export function KanbanColumn({ status, items, onAddItem }: KanbanColumnProps) {
  const config = columnConfig[status];

  return (
    <div className="flex flex-col gap-4 min-w-[280px] w-[280px] md:w-auto md:min-w-0 snap-center">
      {/* Column Header with Count Badge */}
      <div className="flex items-center justify-between px-2 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          {config.title}
        </h2>
        <span className="flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
          {items.length}
        </span>
      </div>

      {/* Items Container */}
      <div className="flex flex-col gap-3 h-full overflow-y-auto pb-4 pr-2">
        {items.length === 0 ? (
          // Empty State Placeholder with Dashed Border
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl min-h-[150px] text-slate-400">
            <span className="material-symbols-outlined text-3xl mb-2 opacity-50">
              shopping_bag
            </span>
            <p className="text-xs font-bold opacity-70">Drag items here</p>
            {onAddItem && (
              <button
                onClick={() => onAddItem(status)}
                className="mt-3 text-xs font-medium text-slate-500 hover:text-primary transition-colors min-h-[44px] px-4"
              >
                + Add Item
              </button>
            )}
          </div>
        ) : (
          // Item Cards
          items.map((item) => (
            <KanbanCard key={item.id} item={item} status={status} />
          ))
        )}
      </div>
    </div>
  );
}
