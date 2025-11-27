/**
 * ListItemRow Component
 *
 * Single list item row displaying gift name, price, status, and notes.
 * Shows gift image if available, links to gift detail page.
 * Mobile-first with 44px touch targets.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { GiftIcon } from '@/components/layout/icons';
import type { ListItemWithGift, ListItemStatus } from '@/types';

interface ListItemRowProps {
  item: ListItemWithGift;
  onStatusChange?: (newStatus: ListItemStatus) => void;
}

// Status badge variants
const statusVariants: Record<ListItemStatus, 'warning' | 'default' | 'success' | 'default'> = {
  idea: 'warning',
  selected: 'default',
  purchased: 'success',
  received: 'default',
};

export function ListItemRow({ item, onStatusChange }: ListItemRowProps) {
  return (
    <li className="p-4 flex items-center gap-4 min-h-[88px] hover:bg-gray-50 transition-colors">
      {/* Gift Image or Placeholder */}
      {item.gift?.image_url ? (
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={item.gift.image_url}
            alt={item.gift.name}
            fill
            className="object-cover rounded"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          <GiftIcon className="w-6 h-6 text-gray-400" />
        </div>
      )}

      {/* Gift Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/gifts/${item.gift_id}`}
          className="font-medium text-gray-900 hover:text-primary-600 hover:underline block truncate"
        >
          {item.gift?.name ?? `Gift #${item.gift_id}`}
        </Link>

        {/* Price */}
        {item.gift?.price && (
          <p className="text-sm text-gray-500 mt-0.5">
            ${item.gift.price.toFixed(2)}
          </p>
        )}

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-gray-400 truncate mt-1">
            {item.notes}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0">
        <Badge variant={statusVariants[item.status]}>
          {item.status}
        </Badge>
      </div>
    </li>
  );
}
