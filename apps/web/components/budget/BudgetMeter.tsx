'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Budget meter data structure from API
 * Matches the backend BudgetProgressionDTO schema
 */
export interface BudgetMeterData {
  budget_total: number | null;
  purchased_amount: number;
  planned_amount: number;
  remaining_amount: number | null;
  purchased_percent: number;
  planned_percent: number;
  is_over_budget: boolean;
  has_budget: boolean;
}

const budgetMeterVariants = cva(
  'w-full rounded-small overflow-hidden transition-all duration-300 ease-out',
  {
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const budgetTextVariants = cva(
  'font-medium',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface BudgetMeterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof budgetMeterVariants> {
  data: BudgetMeterData;
  onSegmentClick?: (segment: 'purchased' | 'planned' | 'remaining') => void;
  showLabels?: boolean;
}

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
 * BudgetMeter Component
 *
 * Displays a three-segment horizontal progress bar showing:
 * - Purchased amount (green)
 * - Planned amount (blue)
 * - Remaining budget (gray)
 *
 * Features:
 * - Accessible with ARIA attributes
 * - Keyboard navigation for clickable segments
 * - Mobile-first with 44px touch targets
 * - Over-budget indicator (red border)
 * - Size variants (sm, md, lg)
 *
 * @example
 * ```tsx
 * <BudgetMeter
 *   data={budgetData}
 *   onSegmentClick={(segment) => console.log(segment)}
 *   showLabels={true}
 * />
 * ```
 */
export const BudgetMeter = React.forwardRef<HTMLDivElement, BudgetMeterProps>(
  ({ className, data, size = 'md', onSegmentClick, showLabels = true, ...props }, ref) => {
    // Handle no budget state
    if (!data.has_budget) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center justify-center p-6 rounded-medium border-2 border-dashed border-border-subtle bg-surface-secondary',
            className
          )}
          {...props}
        >
          <p className={cn('text-warm-600', budgetTextVariants({ size }))}>
            No budget set
          </p>
        </div>
      );
    }

    const totalUsed = data.purchased_percent + data.planned_percent;
    const isInteractive = !!onSegmentClick;

    // Calculate segment click handler
    const handleSegmentClick = (segment: 'purchased' | 'planned' | 'remaining') => {
      if (onSegmentClick) {
        onSegmentClick(segment);
      }
    };

    // Keyboard handler for accessibility
    const handleKeyDown = (
      segment: 'purchased' | 'planned' | 'remaining',
      event: React.KeyboardEvent
    ) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSegmentClick(segment);
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Progress Bar */}
        <div
          className={cn(
            budgetMeterVariants({ size }),
            'flex bg-gray-200 border-2',
            data.is_over_budget
              ? 'border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
              : 'border-transparent'
          )}
          role="progressbar"
          aria-valuenow={totalUsed}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Budget progress: ${totalUsed.toFixed(1)}% used. ${
            data.is_over_budget ? 'Over budget!' : ''
          }`}
        >
          {/* Purchased Segment */}
          {data.purchased_percent > 0 && (
            <div
              className={cn(
                'bg-emerald-500 transition-all duration-300 ease-out',
                isInteractive &&
                  'hover:bg-emerald-600 cursor-pointer active:bg-emerald-700 min-w-[44px]'
              )}
              style={{ width: `${data.purchased_percent}%` }}
              onClick={isInteractive ? () => handleSegmentClick('purchased') : undefined}
              onKeyDown={
                isInteractive ? (e) => handleKeyDown('purchased', e) : undefined
              }
              tabIndex={isInteractive ? 0 : undefined}
              role={isInteractive ? 'button' : undefined}
              aria-label={`Purchased: ${formatCurrency(data.purchased_amount)}, ${data.purchased_percent.toFixed(1)}%`}
            />
          )}

          {/* Planned Segment */}
          {data.planned_percent > 0 && (
            <div
              className={cn(
                'bg-blue-500 transition-all duration-300 ease-out',
                isInteractive &&
                  'hover:bg-blue-600 cursor-pointer active:bg-blue-700 min-w-[44px]'
              )}
              style={{ width: `${data.planned_percent}%` }}
              onClick={isInteractive ? () => handleSegmentClick('planned') : undefined}
              onKeyDown={
                isInteractive ? (e) => handleKeyDown('planned', e) : undefined
              }
              tabIndex={isInteractive ? 0 : undefined}
              role={isInteractive ? 'button' : undefined}
              aria-label={`Planned: ${formatCurrency(data.planned_amount)}, ${data.planned_percent.toFixed(1)}%`}
            />
          )}

          {/* Remaining Segment (implicit - fills remaining space) */}
        </div>

        {/* Labels */}
        {showLabels && (
          <div className="mt-3 space-y-2">
            {/* Dollar Amounts */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                <span className={cn('text-emerald-700', budgetTextVariants({ size }))}>
                  Spent: {formatCurrency(data.purchased_amount)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-blue-500"
                  aria-hidden="true"
                />
                <span className={cn('text-blue-700', budgetTextVariants({ size }))}>
                  Planned: {formatCurrency(data.planned_amount)}
                </span>
              </div>

              {data.remaining_amount !== null && data.remaining_amount >= 0 && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full bg-gray-400"
                    aria-hidden="true"
                  />
                  <span className={cn('text-gray-600', budgetTextVariants({ size }))}>
                    Remaining: {formatCurrency(data.remaining_amount)}
                  </span>
                </div>
              )}
            </div>

            {/* Total and Percentage */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-border-subtle">
              <span className={cn('text-warm-900 font-semibold', budgetTextVariants({ size }))}>
                Total: {data.budget_total !== null ? formatCurrency(data.budget_total) : 'N/A'}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  budgetTextVariants({ size }),
                  data.is_over_budget ? 'text-red-600' : 'text-warm-700'
                )}
              >
                {totalUsed.toFixed(1)}% used
                {data.is_over_budget && ' (Over budget!)'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

BudgetMeter.displayName = 'BudgetMeter';
