/**
 * KanbanCard Component
 *
 * Displays a gift item card in the Kanban board with:
 * - Product image (rounded-2xl)
 * - Title and status badge
 * - Assigned to info
 * - Approximate price
 * - Comment indicator (for shortlisted)
 *
 * Glassmorphism effect with large rounded corners.
 * Mobile-first with 44px touch targets.
 */

'use client';

import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { CheckIcon, MessageCircleIcon } from '@/components/layout/icons';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface KanbanCardProps {
  item: ListItemWithGift;
  status: ListItemStatus;
}

// Status badge colors
const statusBadgeConfig: Record<
  ListItemStatus,
  { bgColor: string; textColor: string; label: string }
> = {
  idea: {
    bgColor: 'bg-[#DDBEA9]',
    textColor: 'text-[#5e4b3e]',
    label: 'Idea',
  },
  selected: {
    bgColor: 'bg-[#D08C78]',
    textColor: 'text-white',
    label: 'Shortlisted',
  },
  purchased: {
    bgColor: 'bg-[#AEC3B0]',
    textColor: 'text-[#3e5240]',
    label: 'Purchased',
  },
  received: {
    bgColor: 'bg-gray-400',
    textColor: 'text-white',
    label: 'Received',
  },
};

export function KanbanCard({ item, status }: KanbanCardProps) {
  const badgeConfig = statusBadgeConfig[status];
  const hasNotes = Boolean(item.notes && item.notes.trim());
  const isPurchased = status === 'purchased' || status === 'received';

  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow',
        'backdrop-blur-sm',
        isPurchased && 'opacity-75 hover:opacity-100'
      )}
    >
      {/* Card Content */}
      <div className="flex items-start gap-4 mb-4">
        {/* Product Image */}
        {item.gift.image_url ? (
          <img
            src={item.gift.image_url}
            alt={item.gift.name}
            className="w-16 h-16 rounded-2xl object-cover bg-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-gray-400 text-xs font-medium">No image</span>
          </div>
        )}

        {/* Title and Badge */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 leading-tight mb-1 line-clamp-2">
            {item.gift.name}
          </h3>
          <span
            className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-bold',
              badgeConfig.bgColor,
              badgeConfig.textColor
            )}
          >
            {badgeConfig.label}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-medium text-gray-500">
        {/* Assigned To or Price */}
        {item.assigned_to ? (
          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 text-xs">
            Assigned to: User {item.assigned_to}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">Unassigned</span>
        )}

        {/* Price or Status Icons */}
        <div className="flex items-center gap-2">
          {item.gift.price && (
            <span className="text-gray-600 font-semibold">
              ${formatPrice(item.gift.price)}
            </span>
          )}

          {/* Comments indicator for shortlisted items */}
          {status === 'selected' && hasNotes && (
            <MessageCircleIcon className="w-5 h-5 text-gray-400" />
          )}

          {/* Checkmark for purchased items */}
          {isPurchased && <CheckIcon className="w-5 h-5 text-gray-400" />}
        </div>
      </div>
    </div>
  );
}
