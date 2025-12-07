'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersonBudget } from '@/hooks/usePersonBudget';
import { useGiftsByPerson } from '@/hooks/useGifts';
import { useEntityModal } from '@/components/modals';
import { StackedProgressBar, type TooltipItem } from '@/components/ui/stacked-progress-bar';
import type { Gift } from '@/types';

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
 * Displays two stacked progress bars showing:
 * 1. "Gifts to Receive" - gifts assigned TO this person as recipient
 * 2. "Gifts to Buy" - gifts assigned BY this person as purchaser
 *
 * Features:
 * - Card variant: Only shows if data exists (compact display)
 * - Modal variant: Always shows (full display with zero states)
 * - Interactive tooltips showing gift details
 * - Clickable gifts in tooltips to open gift modal
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

  // Calculate budget estimates
  // Recipient: Use assigned total * 1.5 as budget estimate (or 500 minimum)
  const recipientBudgetTotal = Math.max(budget.gifts_assigned_total * 1.5, 500);

  // Purchaser: Use (to_purchase + purchased) * 1.2 as budget estimate
  const purchaserPlannedTotal = budget.gifts_to_purchase_total + budget.gifts_purchased_total;
  const purchaserBudgetTotal = Math.max(purchaserPlannedTotal * 1.2, 100);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Gifts to Receive (Recipient role) */}
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

      {/* Gifts to Buy (Purchaser role) */}
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
    </div>
  );
}

PersonBudgetBar.displayName = 'PersonBudgetBar';
