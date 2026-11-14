'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'animate-pulse bg-gray-200 rounded-small',
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

const skeletonTextVariants = cva(
  'animate-pulse bg-gray-200 rounded-small',
  {
    variants: {
      size: {
        sm: 'h-3',
        md: 'h-4',
        lg: 'h-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface BudgetMeterSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  showLabels?: boolean;
}

/**
 * BudgetMeterSkeleton Component
 *
 * Loading state placeholder for BudgetMeter component.
 * Displays animated skeleton matching the structure of the actual meter.
 *
 * @example
 * ```tsx
 * <BudgetMeterSkeleton size="md" showLabels={true} />
 * ```
 */
export const BudgetMeterSkeleton = React.forwardRef<
  HTMLDivElement,
  BudgetMeterSkeletonProps
>(({ className, size = 'md', showLabels = true, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      {/* Progress Bar Skeleton */}
      <div
        className={cn(skeletonVariants({ size }), 'w-full')}
        aria-label="Loading budget meter..."
        aria-busy="true"
      />

      {/* Labels Skeleton */}
      {showLabels && (
        <div className="mt-3 space-y-2">
          {/* Dollar Amounts Skeleton */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
              <div className={cn(skeletonTextVariants({ size }), 'w-24')} />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
              <div className={cn(skeletonTextVariants({ size }), 'w-24')} />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse" />
              <div className={cn(skeletonTextVariants({ size }), 'w-28')} />
            </div>
          </div>

          {/* Total and Percentage Skeleton */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 border-t border-border-subtle">
            <div className={cn(skeletonTextVariants({ size }), 'w-32')} />
            <div className={cn(skeletonTextVariants({ size }), 'w-24')} />
          </div>
        </div>
      )}
    </div>
  );
});

BudgetMeterSkeleton.displayName = 'BudgetMeterSkeleton';
