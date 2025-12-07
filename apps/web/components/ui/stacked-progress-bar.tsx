'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

/**
 * Format currency using USD locale
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Tooltip item data structure
 */
export interface TooltipItem {
  id: number | string;
  name: string;
  price: number;
  status: 'purchased' | 'planned';
  imageUrl?: string;
}

export interface StackedProgressBarProps {
  /** Total budget/capacity (full bar width) */
  total: number;
  /** Planned/attached amount (Color_B) */
  planned: number;
  /** Purchased amount within planned (Color_C, overlays planned) */
  purchased: number;
  /** Label text (e.g., "Gifts to Give") */
  label?: string;
  /** Show amounts in header */
  showAmounts?: boolean;
  /** Show column headers above amounts */
  showHeaders?: boolean;
  /** Variant: 'recipient' or 'purchaser' for different color schemes */
  variant?: 'recipient' | 'purchaser';
  /** Height of the bar */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
  /** Tooltip content for hover - list of items to show */
  tooltipItems?: TooltipItem[];
  /** Callback when a tooltip item is clicked */
  onItemClick?: (id: number | string) => void;
  /** Maximum number of tooltip items to show (default: 5) */
  maxTooltipItems?: number;
}

/**
 * StackedProgressBar Component
 *
 * A stacked/layered progress bar showing multiple segments:
 * - Track (full width): Subtle grey background
 * - Planned segment (Color_B): Mustard/Amber for planned/attached gifts
 * - Purchased segment (Color_C): Sage/Green for purchased portion
 *
 * The segments stack left-to-right:
 * |████████████████░░░░░░░░░░░░░░░░░░░░|
 *  └─purchased─┘└─planned─┘└──remaining──┘
 *
 * Features:
 * - Soft Modernity design with warm colors and rounded corners
 * - Accessible with ARIA attributes
 * - Optional tooltip showing gift details on hover
 * - Currency formatting
 * - Multiple size variants
 * - Touch-friendly (44px minimum when interactive)
 *
 * @example
 * ```tsx
 * // With headers and amounts
 * <StackedProgressBar
 *   total={200}
 *   planned={100}
 *   purchased={75}
 *   label="Gifts to Give"
 *   showAmounts
 *   showHeaders
 *   variant="recipient"
 *   tooltipItems={gifts.map(g => ({
 *     id: g.id,
 *     name: g.name,
 *     price: g.price,
 *     status: g.purchase_date ? 'purchased' : 'planned',
 *     imageUrl: g.image_url
 *   }))}
 *   onItemClick={(id) => openGiftModal(String(id))}
 * />
 *
 * // Without headers (original behavior)
 * <StackedProgressBar
 *   total={200}
 *   planned={100}
 *   purchased={75}
 *   label="Gifts to Give"
 *   showAmounts
 *   variant="recipient"
 * />
 * ```
 */
export function StackedProgressBar({
  total,
  planned,
  purchased,
  label,
  showAmounts = false,
  showHeaders = false,
  variant = 'recipient',
  size = 'md',
  className,
  tooltipItems = [],
  onItemClick,
  maxTooltipItems = 5,
}: StackedProgressBarProps) {
  // Calculate percentages
  const purchasedPercent = total > 0 ? (purchased / total) * 100 : 0;
  const remainingPlannedAmount = Math.max(0, planned - purchased);
  const remainingPlannedPercent = total > 0 ? (remainingPlannedAmount / total) * 100 : 0;
  const totalUsedPercent = purchasedPercent + remainingPlannedPercent;

  // Color schemes based on variant
  const colors = {
    recipient: {
      purchased: 'bg-emerald-500',
      planned: 'bg-amber-400',
    },
    purchaser: {
      purchased: 'bg-emerald-500',
      planned: 'bg-amber-400',
    },
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // Prepare tooltip items
  const visibleTooltipItems = tooltipItems.slice(0, maxTooltipItems);
  const hasOverflow = tooltipItems.length > maxTooltipItems;
  const overflowCount = tooltipItems.length - maxTooltipItems;
  const hasTooltip = tooltipItems.length > 0;

  const progressBar = (
    <div className="w-full">
      {/* Label */}
      {label && (
        <div className="mb-1.5">
          <span className="text-xs text-gray-500 font-medium">{label}</span>
        </div>
      )}

      {/* Column headers (optional) */}
      {showHeaders && showAmounts && (
        <div className="flex gap-4 mb-1">
          <span className="flex-1 text-xs font-semibold text-warm-500">
            Purchased
          </span>
          <span className="flex-1 text-xs font-semibold text-warm-500">
            Planned
          </span>
          <span className="flex-[1.2] text-xs font-semibold text-warm-500 text-right">
            Budget
          </span>
        </div>
      )}

      {/* Amount values */}
      {showAmounts && (
        <div className="flex gap-4 mb-2">
          <span className="flex-1 text-sm font-semibold text-gray-900">
            {formatCurrency(purchased)}
          </span>
          <span className="flex-1 text-sm font-semibold text-gray-900">
            {formatCurrency(planned)}
          </span>
          <span className="flex-[1.2] text-sm font-semibold text-gray-900 text-right">
            {formatCurrency(total)}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div
        className={cn(
          'relative w-full bg-warm-200 rounded-full overflow-hidden',
          sizeClasses[size],
          className
        )}
        role="progressbar"
        aria-valuenow={totalUsedPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label || 'Progress'}: ${formatCurrency(purchased)} purchased, ${formatCurrency(remainingPlannedAmount)} planned, ${formatCurrency(Math.max(0, total - planned))} remaining`}
      >
        {/* Purchased segment (green/sage) */}
        {purchasedPercent > 0 && (
          <div
            className={cn(
              'absolute left-0 h-full rounded-full transition-all duration-300 ease-out',
              colors[variant].purchased
            )}
            style={{ width: `${purchasedPercent}%` }}
            aria-label={`Purchased: ${formatCurrency(purchased)}, ${purchasedPercent.toFixed(1)}%`}
          />
        )}

        {/* Remaining planned segment (amber/mustard) */}
        {remainingPlannedPercent > 0 && (
          <div
            className={cn(
              'absolute h-full rounded-full transition-all duration-300 ease-out',
              colors[variant].planned
            )}
            style={{
              left: `${purchasedPercent}%`,
              width: `${remainingPlannedPercent}%`,
            }}
            aria-label={`Planned: ${formatCurrency(remainingPlannedAmount)}, ${remainingPlannedPercent.toFixed(1)}%`}
          />
        )}
      </div>
    </div>
  );

  // If no tooltip items, return progress bar only
  if (!hasTooltip) {
    return progressBar;
  }

  // Wrap with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer min-h-[44px] flex items-center">
            {progressBar}
          </div>
        </TooltipTrigger>
        <TooltipContent
          className="w-[320px] max-w-[90vw] p-3 bg-white border border-warm-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tooltip items */}
          <div className="space-y-2">
            {visibleTooltipItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md hover:bg-warm-50 transition-colors',
                  onItemClick && 'cursor-pointer'
                )}
                onClick={() => onItemClick?.(item.id)}
              >
                {/* Image thumbnail */}
                {item.imageUrl ? (
                  <div className="relative w-10 h-10 rounded-sm overflow-hidden flex-shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-sm bg-warm-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-warm-500 font-medium">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Gift details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                {/* Status badge */}
                <Badge
                  variant={item.status === 'purchased' ? 'purchased' : 'progress'}
                  size="sm"
                  className="flex-shrink-0"
                >
                  {item.status === 'purchased' ? 'Purchased' : 'Planned'}
                </Badge>
              </div>
            ))}
          </div>

          {/* Overflow indicator */}
          {hasOverflow && (
            <div className="pt-2 mt-2 border-t border-warm-200 flex justify-center">
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

StackedProgressBar.displayName = 'StackedProgressBar';
