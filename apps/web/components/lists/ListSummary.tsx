/**
 * ListSummary Component
 *
 * Summary statistics showing count of items in each status.
 * Displays in a responsive grid with icons and counts.
 * Mobile-first: 2 columns on mobile, 4 columns on tablet+.
 */

'use client';

import { Card } from '@/components/ui/card';
import {
  LightbulbIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  GiftIcon,
} from '@/components/layout/icons';
import type { ListItemWithGift, ListItemStatus } from '@/types';
import type { ComponentType } from 'react';

interface ListSummaryProps {
  items: ListItemWithGift[];
}

// Status order for display
const statusOrder: ListItemStatus[] = ['idea', 'to_buy', 'purchased', 'gifted'];

// Status icons
const statusIcons: Record<ListItemStatus, ComponentType<{ className?: string }>> = {
  idea: LightbulbIcon,
  selected: CheckCircleIcon,
  to_buy: ShoppingCartIcon,
  purchased: ShoppingCartIcon,
  received: GiftIcon,
  gifted: GiftIcon,
};

// Status colors
const statusColors: Record<ListItemStatus, string> = {
  idea: 'text-yellow-600',
  selected: 'text-blue-600',
  to_buy: 'text-red-600',
  purchased: 'text-green-600',
  received: 'text-gray-600',
  gifted: 'text-purple-600',
};

// Status labels
const statusLabels: Record<ListItemStatus, string> = {
  idea: 'Ideas',
  selected: 'Selected',
  to_buy: 'To Buy',
  purchased: 'Purchased',
  received: 'Received',
  gifted: 'Gifted',
};

export function ListSummary({ items }: ListSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statusOrder.map((status) => {
        const count = items.filter((item) => item.status === status).length;
        const StatusIcon = statusIcons[status];

        return (
          <Card key={status} variant="default" padding="default" className="text-center">
            <StatusIcon className={`mx-auto w-8 h-8 mb-2 ${statusColors[status]}`} />
            <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
            <div className="text-sm text-gray-500 capitalize">{statusLabels[status]}</div>
          </Card>
        );
      })}
    </div>
  );
}
