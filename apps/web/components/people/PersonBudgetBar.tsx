'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersonBudget } from '@/hooks/usePersonBudget';
import { useGiftsByPerson } from '@/hooks/useGifts';
import { useEntityModal } from '@/components/modals';
import { StackedProgressBar, type TooltipItem } from '@/components/ui/stacked-progress-bar';

export interface PersonBudgetBarProps {
  personId: number;
  variant?: 'card' | 'modal';  // card=compact, modal=full
  occasionId?: number;
  className?: string;
  recipientBudgetTotal?: number | null;  // Set budget for gifts TO this person (null = no budget)
  purchaserBudgetTotal?: number | null;  // Set budget for gifts BY this person (null = no budget)
}

/**
 * PersonBudgetBar Component
 *
 * Displays budget visualization for a person in two roles:
 * 1. "Gifts to Receive" - gifts assigned TO this person as recipient
 * 2. "Gifts to Buy" - gifts assigned BY this person as purchaser
 *
 * Display Logic (per role):
 * - No budget + No gifts → Section hidden
 * - No budget + Has gifts → Totals only (no progress bar)
 * - Has budget + No gifts → Empty progress bar ($0/$0 of budget)
 * - Has budget + Has gifts → Full progress bar
 *
 * Features:
 * - Conditional display based on budget existence
 * - Card variant: Only shows if data exists (compact display)
 * - Modal variant: Shows appropriate states per logic matrix
 * - Interactive tooltips showing gift details
 * - Clickable gifts in tooltips to open gift modal
 * - Mobile-first responsive design
 * - Currency formatting
 * - Loading states
 *
 * @example
 * ```tsx
 * // Without budgets (will show totals only if gifts exist)
 * <PersonBudgetBar personId={1} variant="card" />
 *
 * // With budgets set (will show progress bars)
 * <PersonBudgetBar
 *   personId={1}
 *   variant="modal"
 *   occasionId={5}
 *   recipientBudgetTotal={500}
 *   purchaserBudgetTotal={300}
 * />
 * ```
 */
export function PersonBudgetBar({
  personId,
  variant = 'modal',
  occasionId,
  className,
  recipientBudgetTotal,
  purchaserBudgetTotal,
}: PersonBudgetBarProps) {
  const { data: budget, isLoading } = usePersonBudget(personId, occasionId);
  const { data: giftsData } = useGiftsByPerson(personId);
  const { openModal: openGiftModal } = useEntityModal('gift');

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

  const gifts = giftsData?.items || [];

  // For now, show all gifts associated with this person in both tooltips
  // TODO: Once backend provides gift_people relationship data with is_recipient/is_purchaser flags,
  // filter gifts properly by role
  const allGiftTooltipItems: TooltipItem[] = gifts.map((gift) => ({
    id: gift.id,
    name: gift.name,
    price: gift.price || 0,
    status: gift.purchase_date ? 'purchased' : 'planned',
    imageUrl: gift.image_url || undefined,
  }));

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Recipient role display logic
  const hasRecipientBudget = recipientBudgetTotal !== null && recipientBudgetTotal !== undefined;
  const hasRecipientGifts = budget.gifts_assigned_count > 0;

  // Purchaser role display logic
  const hasPurchaserBudget = purchaserBudgetTotal !== null && purchaserBudgetTotal !== undefined;
  const purchaserPlannedTotal = budget.gifts_to_purchase_total + budget.gifts_purchased_total;
  const hasPurchaserGifts = budget.gifts_purchased_count > 0 || budget.gifts_to_purchase_count > 0;

  // Determine what to render for each section
  const shouldShowRecipient = hasRecipientBudget || hasRecipientGifts;
  const shouldShowPurchaser = hasPurchaserBudget || hasPurchaserGifts;

  // If nothing to show, return null
  if (!shouldShowRecipient && !shouldShowPurchaser) {
    return null;
  }

  // Totals-only component (when no budget but has gifts)
  const TotalsOnly = ({ purchased, planned, label }: { purchased: number; planned: number; label: string }) => (
    <div>
      <div className="text-xs text-gray-500 font-medium mb-1.5">{label}</div>
      <div className="text-sm font-medium text-gray-700">
        <span className="text-emerald-600">Purchased: {formatCurrency(purchased)}</span>
        <span className="mx-2 text-gray-400">•</span>
        <span className="text-amber-600">Planned: {formatCurrency(planned - purchased)}</span>
        <span className="mx-2 text-gray-400">•</span>
        <span className="text-gray-900">Total: {formatCurrency(planned)}</span>
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Gifts to Receive (Recipient role) */}
      {shouldShowRecipient && (
        <>
          {!hasRecipientBudget && hasRecipientGifts ? (
            // State: No budget, has gifts → Totals only
            <TotalsOnly
              purchased={budget.gifts_assigned_purchased_total}
              planned={budget.gifts_assigned_total}
              label="Gifts to Receive"
            />
          ) : hasRecipientBudget ? (
            // State: Has budget (with or without gifts) → Progress bar
            <StackedProgressBar
              total={recipientBudgetTotal}
              planned={budget.gifts_assigned_total}
              purchased={budget.gifts_assigned_purchased_total}
              label="Gifts to Receive"
              showAmounts
              variant="recipient"
              tooltipItems={allGiftTooltipItems}
              onItemClick={(id) => openGiftModal(String(id))}
            />
          ) : null}
        </>
      )}

      {/* Gifts to Buy (Purchaser role) */}
      {shouldShowPurchaser && (
        <>
          {!hasPurchaserBudget && hasPurchaserGifts ? (
            // State: No budget, has gifts → Totals only
            <TotalsOnly
              purchased={budget.gifts_purchased_total}
              planned={purchaserPlannedTotal}
              label="Gifts to Buy"
            />
          ) : hasPurchaserBudget ? (
            // State: Has budget (with or without gifts) → Progress bar
            <StackedProgressBar
              total={purchaserBudgetTotal}
              planned={purchaserPlannedTotal}
              purchased={budget.gifts_purchased_total}
              label="Gifts to Buy"
              showAmounts
              variant="purchaser"
              tooltipItems={allGiftTooltipItems}
              onItemClick={(id) => openGiftModal(String(id))}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

PersonBudgetBar.displayName = 'PersonBudgetBar';
