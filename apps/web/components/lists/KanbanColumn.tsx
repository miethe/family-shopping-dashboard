/**
 * KanbanColumn Component
 *
 * Displays a column in the Kanban board with colored header and gift cards.
 * Inspired by SingleListView design with mustard/coral/sage color scheme.
 * Mobile-first responsive layout.
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

// Column headers and colors mapping
const columnConfig: Record<
  ListItemStatus,
  { title: string; headerColor: string; textColor: string }
> = {
  idea: {
    title: 'Idea',
    headerColor: 'bg-[#DDBEA9]',
    textColor: 'text-[#5e4b3e]',
  },
  selected: {
    title: 'Shortlisted',
    headerColor: 'bg-[#D08C78]',
    textColor: 'text-white',
  },
  purchased: {
    title: 'Purchased',
    headerColor: 'bg-[#AEC3B0]',
    textColor: 'text-[#3e5240]',
  },
  received: {
    title: 'Received',
    headerColor: 'bg-gray-400',
    textColor: 'text-white',
  },
};

export function KanbanColumn({ status, items, onAddItem }: KanbanColumnProps) {
  const config = columnConfig[status];

  return (
    <div className="flex flex-col gap-4">
      {/* Column Header */}
      <div
        className={cn(
          'text-center font-bold py-3 rounded-t-2xl',
          config.headerColor,
          config.textColor
        )}
      >
        {config.title}
      </div>

      {/* Items Container */}
      <div className="space-y-4">
        {items.length === 0 ? (
          // Empty State
          <div className="bg-white/50 rounded-3xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-400 mb-3">No items yet</p>
            {onAddItem && (
              <button
                onClick={() => onAddItem(status)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] px-4"
              >
                + Add {config.title}
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
