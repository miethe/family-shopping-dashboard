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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LightbulbIcon,
  CheckCircleIcon,
  ShoppingCartIcon,
  GiftIcon,
  PlusIcon,
} from '@/components/layout/icons';
import { ListItemRow } from './ListItemRow';
import type { ListItemWithGift, ListItemStatus } from '@/types';
import type { ComponentType } from 'react';

interface ListItemGroupProps {
  status: ListItemStatus;
  items: ListItemWithGift[];
  onItemStatusChange?: (itemId: number, newStatus: ListItemStatus) => void;
  onAddItem?: (status: ListItemStatus) => void;
}

// Status icons
const statusIcons: Record<ListItemStatus, ComponentType<{ className?: string }>> = {
  idea: LightbulbIcon,
  selected: CheckCircleIcon,
  to_buy: ShoppingCartIcon,
  purchased: ShoppingCartIcon,
  received: GiftIcon,
  gifted: GiftIcon,
};

// Status colors for header
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

// Status descriptions for tooltips
const statusDescriptions: Record<ListItemStatus, string> = {
  idea: 'Gift ideas being considered',
  selected: 'Items chosen to purchase',
  to_buy: 'Items ready to buy',
  purchased: 'Items that have been bought',
  received: 'Items that have been received',
  gifted: 'Items that have been given',
};

export function ListItemGroup({ status, items, onItemStatusChange, onAddItem }: ListItemGroupProps) {
  const StatusIcon = statusIcons[status];

  return (
    <Card variant="default" padding="none">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <StatusIcon className={`w-5 h-5 ${statusColors[status]}`} />
                <h3 className="font-semibold text-gray-900 capitalize">
                  {statusLabels[status]}
                </h3>
                <Badge variant="default" size="sm">
                  {items.length}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusDescriptions[status]}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Items List or Empty State */}
      {items.length === 0 ? (
        <div className="p-8 text-center">
          <StatusIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500 mb-4">No items in {statusLabels[status].toLowerCase()}</p>
          {onAddItem && (
            <button
              onClick={() => onAddItem(status)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-[44px]"
            >
              <PlusIcon className="w-4 h-4" />
              Add {statusLabels[status].replace(/s$/, '')}
            </button>
          )}
        </div>
      ) : (
        <div>
          {/* Add Item Button - shown at top when items exist */}
          {onAddItem && (
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => onAddItem(status)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-[44px] w-full"
              >
                <PlusIcon className="w-4 h-4" />
                Add {statusLabels[status].replace(/s$/, '')}
              </button>
            </div>
          )}

          {/* Items List */}
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
        </div>
      )}
    </Card>
  );
}
