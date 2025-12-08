/**
 * PersonBudgetsTab Component
 *
 * Displays all occasions linked to a person with budget management for each.
 * Shows budget inputs and progress bars for both recipient and purchaser roles per occasion.
 *
 * Features:
 * - Lists all linked occasions with budget inputs
 * - Toggle to show/hide past (inactive) occasions
 * - Visual progress bars via PersonBudgetBar
 * - Empty state handling
 * - Mobile-first responsive design
 * - 44px touch targets
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useOccasions } from '@/hooks/useOccasions';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '@/hooks/usePersonOccasionBudget';
import { PersonBudgetBar } from '@/components/people/PersonBudgetBar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { Occasion } from '@/types';

export interface PersonBudgetsTabProps {
  personId: number;
  occasionIds: number[];
}

/**
 * Sub-component for individual occasion budget row
 */
interface OccasionBudgetRowProps {
  personId: number;
  occasion: Occasion;
}

const OccasionBudgetRowComponent = ({ personId, occasion }: OccasionBudgetRowProps) => {
  const { data: budget, isLoading } = usePersonOccasionBudget(personId, occasion.id);
  const updateBudget = useUpdatePersonOccasionBudget(personId, occasion.id);

  // Local state for input fields (controlled inputs)
  const [recipientBudget, setRecipientBudget] = React.useState<string>('');
  const [purchaserBudget, setPurchaserBudget] = React.useState<string>('');

  // Initialize inputs when budget data loads
  React.useEffect(() => {
    if (budget) {
      setRecipientBudget(
        budget.recipient_budget_total !== null ? String(budget.recipient_budget_total) : ''
      );
      setPurchaserBudget(
        budget.purchaser_budget_total !== null ? String(budget.purchaser_budget_total) : ''
      );
    }
  }, [budget]);

  // Format date for display
  const formattedDate = new Date(occasion.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine if occasion is past
  const isPast = !occasion.is_active;

  // Handle budget input changes (debounced update)
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRecipientBudget(value);
  };

  const handlePurchaserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPurchaserBudget(value);
  };

  // Save budget on blur
  const handleRecipientBlur = () => {
    const numValue = parseFloat(recipientBudget);
    if (!isNaN(numValue) && numValue >= 0) {
      updateBudget.mutate({ recipient_budget_total: numValue });
    } else if (recipientBudget === '') {
      updateBudget.mutate({ recipient_budget_total: null });
    }
  };

  const handlePurchaserBlur = () => {
    const numValue = parseFloat(purchaserBudget);
    if (!isNaN(numValue) && numValue >= 0) {
      updateBudget.mutate({ purchaser_budget_total: numValue });
    } else if (purchaserBudget === '') {
      updateBudget.mutate({ purchaser_budget_total: null });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse p-4 bg-warm-50 rounded-medium border-2 border-border-light">
        <div className="h-4 bg-warm-200 rounded w-1/2" />
        <div className="h-10 bg-warm-200 rounded" />
        <div className="h-10 bg-warm-200 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-medium border-2 border-border-light shadow-subtle">
      {/* Occasion Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-warm-900">{occasion.name}</h3>
            {isPast && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warm-200 text-warm-700">
                Past
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-warm-600">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="capitalize">{occasion.type}</span>
            {occasion.subtype && (
              <>
                <span>•</span>
                <span className="capitalize">{occasion.subtype}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Budget Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="number"
          label="Gifts to Receive Budget"
          placeholder="0.00"
          value={recipientBudget}
          onChange={handleRecipientChange}
          onBlur={handleRecipientBlur}
          min="0"
          step="0.01"
          helperText="Budget for gifts TO this person"
        />
        <Input
          type="number"
          label="Gifts to Buy Budget"
          placeholder="0.00"
          value={purchaserBudget}
          onChange={handlePurchaserChange}
          onBlur={handlePurchaserBlur}
          min="0"
          step="0.01"
          helperText="Budget for gifts BY this person"
        />
      </div>

      {/* Budget Progress */}
      {budget && (
        <PersonBudgetBar
          personId={personId}
          occasionId={occasion.id}
          variant="modal"
          recipientBudgetTotal={budget.recipient_budget_total}
          purchaserBudgetTotal={budget.purchaser_budget_total}
        />
      )}
    </div>
  );
};

const OccasionBudgetRow = React.memo(OccasionBudgetRowComponent);

/**
 * Main PersonBudgetsTab Component
 */
export function PersonBudgetsTab({ personId, occasionIds }: PersonBudgetsTabProps) {
  const [showPastOccasions, setShowPastOccasions] = React.useState(false);
  const { data: occasionsData, isLoading } = useOccasions();

  // Filter occasions by person's linked IDs
  const linkedOccasions = React.useMemo(() => {
    if (!occasionsData?.items) return [];
    return occasionsData.items.filter((occasion) => occasionIds.includes(occasion.id));
  }, [occasionsData, occasionIds]);

  // Filter by active/past
  const filteredOccasions = React.useMemo(() => {
    if (showPastOccasions) {
      return linkedOccasions;
    }
    return linkedOccasions.filter((occasion) => occasion.is_active);
  }, [linkedOccasions, showPastOccasions]);

  // Count past occasions
  const pastOccasionCount = linkedOccasions.filter((occasion) => !occasion.is_active).length;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-8 bg-warm-200 rounded w-1/3 animate-pulse" />
        <div className="h-32 bg-warm-200 rounded animate-pulse" />
        <div className="h-32 bg-warm-200 rounded animate-pulse" />
      </div>
    );
  }

  // Empty state: no linked occasions
  if (linkedOccasions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-warm-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-warm-900 mb-2">No Linked Occasions</h3>
        <p className="text-sm text-warm-600 max-w-md">
          This person is not linked to any occasions yet. Link them to occasions to manage budgets
          for gifts they&apos;ll receive or purchase.
        </p>
      </div>
    );
  }

  // Empty state: all occasions are past
  if (filteredOccasions.length === 0 && !showPastOccasions) {
    return (
      <div className="space-y-4 p-4">
        {/* Toggle */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-border-light">
          <Switch
            id="show-past-occasions"
            checked={showPastOccasions}
            onCheckedChange={setShowPastOccasions}
            label="Show Past Occasions"
            description={`${pastOccasionCount} past occasion${pastOccasionCount !== 1 ? 's' : ''}`}
          />
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-warm-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-warm-900 mb-2">No Active Occasions</h3>
          <p className="text-sm text-warm-600 max-w-md">
            All linked occasions are in the past. Toggle &quot;Show Past Occasions&quot; above to view and
            manage budgets for past occasions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Toggle */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-border-light">
        <Switch
          id="show-past-occasions"
          checked={showPastOccasions}
          onCheckedChange={setShowPastOccasions}
          label="Show Past Occasions"
          description={
            pastOccasionCount > 0
              ? `${pastOccasionCount} past occasion${pastOccasionCount !== 1 ? 's' : ''} available`
              : 'No past occasions'
          }
        />
      </div>

      {/* Occasion List */}
      <div className="space-y-4">
        {filteredOccasions.map((occasion) => (
          <OccasionBudgetRow key={occasion.id} personId={personId} occasion={occasion} />
        ))}
      </div>
    </div>
  );
}

PersonBudgetsTab.displayName = 'PersonBudgetsTab';
