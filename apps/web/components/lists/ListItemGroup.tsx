/**
 * ListItemGroup Component
 *
 * Groups list items by status with header, count badge, and list of items.
 * Shows empty state when no items in the group.
 * Mobile-first responsive design.
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LightbulbIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  GiftIcon,
} from '@/components/layout/icons';
import { ListItemRow } from './ListItemRow';
import type { ListItemWithGift, ListItemStatus } from '@/types';
import type { ComponentType } from 'react';

interface ListItemGroupProps {
  status: ListItemStatus;
  items: ListItemWithGift[];
  onItemStatusChange?: (itemId: number, newStatus: ListItemStatus) => void;
}

// Status icons
const statusIcons: Record<ListItemStatus, ComponentType<{ className?: string }>> = {
  idea: LightbulbIcon,
  selected: CheckCircleIcon,
  purchased: ShoppingCartIcon,
  received: GiftIcon,
};

// Status colors for header
const statusColors: Record<ListItemStatus, string> = {
  idea: 'text-yellow-600',
  selected: 'text-blue-600',
  purchased: 'text-green-600',
  received: 'text-gray-600',
};

// Status labels
const statusLabels: Record<ListItemStatus, string> = {
  idea: 'Ideas',
  selected: 'Selected',
  purchased: 'Purchased',
  received: 'Received',
};

export function ListItemGroup({ status, items, onItemStatusChange }: ListItemGroupProps) {
  const StatusIcon = statusIcons[status];

  return (
    <Card variant="default" padding="none">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${statusColors[status]}`} />
          <h3 className="font-semibold text-gray-900 capitalize">
            {statusLabels[status]}
          </h3>
          <Badge variant="default" size="sm">
            {items.length}
          </Badge>
        </div>
      </div>

      {/* Items List or Empty State */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <StatusIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No items in {statusLabels[status].toLowerCase()}</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <ListItemRow
              key={item.id}
              item={item}
              onStatusChange={
                onItemStatusChange
                  ? (newStatus) => onItemStatusChange(item.id, newStatus)
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
