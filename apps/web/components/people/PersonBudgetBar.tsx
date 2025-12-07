'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersonBudget } from '@/hooks/usePersonBudget';

/**
 * Format currency using USD locale
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export interface PersonBudgetBarProps {
  personId: number;
  variant?: 'card' | 'modal';  // card=compact, modal=full
  occasionId?: number;
  className?: string;
}

/**
 * PersonBudgetBar Component
 *
 * Displays two progress bars showing:
 * 1. "Gifts to Give" - gifts assigned TO this person as recipient
 * 2. "Gifts Purchased" - gifts purchased BY this person as purchaser
 *
 * Features:
 * - Card variant: Only shows if data exists (compact display)
 * - Modal variant: Always shows (full display with zero states)
 * - Mobile-first responsive design
 * - Currency formatting
 * - Loading states
 *
 * @example
 * ```tsx
 * <PersonBudgetBar personId={1} variant="card" />
 * <PersonBudgetBar personId={1} variant="modal" occasionId={5} />
 * ```
 */
export function PersonBudgetBar({
  personId,
  variant = 'modal',
  occasionId,
  className,
}: PersonBudgetBarProps) {
  const { data: budget, isLoading } = usePersonBudget(personId, occasionId);

  // Card variant: hide if loading or no data
  if (variant === 'card') {
    if (isLoading || !budget) {
      return null;
    }

    // Only show if there's budget data to display
    const hasData =
      budget.gifts_assigned_count > 0 || budget.gifts_purchased_count > 0;

    if (!hasData) {
      return null;
    }
  }

  // Modal variant: show loading skeleton
  if (isLoading && variant === 'modal') {
    return (
      <div className={cn('space-y-2 animate-pulse', className)}>
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-200 rounded-full w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-200 rounded-full w-full" />
      </div>
    );
  }

  if (!budget) {
    return null;
  }

  // Calculate max value for progress bar scaling
  const maxValue = Math.max(
    budget.gifts_assigned_total,
    budget.gifts_purchased_total,
    500 // Minimum cap for reasonable progress display
  );

  const assignedPercent =
    maxValue > 0 ? (budget.gifts_assigned_total / maxValue) * 100 : 0;
  const purchasedPercent =
    maxValue > 0 ? (budget.gifts_purchased_total / maxValue) * 100 : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Gifts to Give (Assigned TO person as recipient) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Gifts to Give
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(budget.gifts_assigned_total)}
            <span className="text-xs text-gray-500 font-normal ml-1">
              ({budget.gifts_assigned_count}{' '}
              {budget.gifts_assigned_count === 1 ? 'gift' : 'gifts'})
            </span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${assignedPercent}%` }}
            role="progressbar"
            aria-valuenow={assignedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Gifts to give: ${formatCurrency(budget.gifts_assigned_total)}, ${budget.gifts_assigned_count} gifts`}
          />
        </div>
      </div>

      {/* Gifts Purchased (Purchased BY person as purchaser) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Gifts Purchased
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(budget.gifts_purchased_total)}
            <span className="text-xs text-gray-500 font-normal ml-1">
              ({budget.gifts_purchased_count}{' '}
              {budget.gifts_purchased_count === 1 ? 'gift' : 'gifts'})
            </span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${purchasedPercent}%` }}
            role="progressbar"
            aria-valuenow={purchasedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Gifts purchased: ${formatCurrency(budget.gifts_purchased_total)}, ${budget.gifts_purchased_count} gifts`}
          />
        </div>
      </div>
    </div>
  );
}

PersonBudgetBar.displayName = 'PersonBudgetBar';
