'use client';

import * as React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export interface MiniCardTooltipProps<T> {
  /** Array of items to display */
  items: T[];
  /** Maximum number of items to show (default: 5) */
  maxVisible?: number;
  /** Trigger element that shows tooltip on hover */
  trigger: React.ReactNode;
  /** Function to render each item */
  renderItem: (item: T) => React.ReactNode;
  /** Whether tooltip is enabled (default: true, set false if no items) */
  enabled?: boolean;
}

/**
 * MiniCardTooltip Component
 *
 * Generic reusable tooltip that displays mini entity cards on hover.
 * Shows up to maxVisible items with "+N more" badge for overflow.
 *
 * Features:
 * - Accessible (keyboard navigation, screen reader support)
 * - Mobile-friendly (works on touch)
 * - Viewport-aware positioning
 * - Click propagation control
 *
 * Usage:
 * ```tsx
 * <MiniCardTooltip
 *   items={gifts}
 *   maxVisible={5}
 *   trigger={<button>Show Gifts</button>}
 *   renderItem={(gift) => <GiftMiniCard gift={gift} />}
 * />
 * ```
 */
export function MiniCardTooltip<T>({
  items,
  maxVisible = 5,
  trigger,
  renderItem,
  enabled = true,
}: MiniCardTooltipProps<T>) {
  // If disabled or no items, render trigger without tooltip
  if (!enabled || items.length === 0) {
    return <>{trigger}</>;
  }

  const visibleItems = items.slice(0, maxVisible);
  const hasOverflow = items.length > maxVisible;
  const overflowCount = items.length - maxVisible;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {trigger}
        </TooltipTrigger>
        <TooltipContent
          className="w-[300px] max-w-[90vw] p-2 bg-white border border-warm-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visible items */}
          <div className="space-y-1">
            {visibleItems.map((item, index) => (
              <div key={index}>{renderItem(item)}</div>
            ))}
          </div>

          {/* Overflow badge */}
          {hasOverflow && (
            <div className="pt-2 border-t border-warm-200 mt-2 flex justify-center">
              <Badge variant="default" size="sm">
                +{overflowCount} more
              </Badge>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
