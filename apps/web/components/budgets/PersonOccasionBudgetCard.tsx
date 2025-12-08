'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '@/hooks/usePersonOccasionBudget';
import { PersonBudgetBar } from '@/components/people/PersonBudgetBar';
import { usePerson } from '@/hooks/usePersons';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Check, AlertCircle } from '@/components/ui/icons';
import { Card } from '@/components/ui/card';

export interface PersonOccasionBudgetCardProps {
  personId: number;
  occasionId: number;
  className?: string;
}

/**
 * PersonOccasionBudgetCard Component
 *
 * Displays and allows editing of person-occasion budget data with auto-save functionality.
 *
 * Features:
 * - Person info display (avatar, name, relationship)
 * - Budget input fields for recipient and purchaser roles
 * - Auto-save on blur with debouncing
 * - Loading, success, and error states
 * - PersonBudgetBar integration for visual progress
 * - Mobile-first responsive design
 * - Full ARIA accessibility
 *
 * @example
 * ```tsx
 * <PersonOccasionBudgetCard personId={1} occasionId={5} />
 * ```
 */
export function PersonOccasionBudgetCard({
  personId,
  occasionId,
  className,
}: PersonOccasionBudgetCardProps) {
  const { data: person, isLoading: personLoading } = usePerson(personId);
  const { data: budget, isLoading: budgetLoading } = usePersonOccasionBudget(personId, occasionId);
  const updateBudget = useUpdatePersonOccasionBudget(personId, occasionId);

  // Local state for input values
  const [recipientBudget, setRecipientBudget] = React.useState<string>('');
  const [purchaserBudget, setPurchaserBudget] = React.useState<string>('');

  // State for tracking which field was saved (for success indicators)
  const [savedField, setSavedField] = React.useState<'recipient' | 'purchaser' | null>(null);

  // Initialize state from budget data
  React.useEffect(() => {
    if (budget) {
      setRecipientBudget(budget.recipient_budget_total?.toString() || '');
      setPurchaserBudget(budget.purchaser_budget_total?.toString() || '');
    }
  }, [budget]);

  // Clear success indicator after 2 seconds
  React.useEffect(() => {
    if (savedField) {
      const timer = setTimeout(() => setSavedField(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [savedField]);

  // Handle blur event for recipient budget
  const handleRecipientBlur = React.useCallback(() => {
    if (!budget) return;

    const newValue = recipientBudget === '' ? null : parseFloat(recipientBudget);
    const currentValue = budget.recipient_budget_total;

    // Only save if value changed
    if (newValue !== currentValue) {
      updateBudget.mutate(
        { recipient_budget_total: newValue },
        {
          onSuccess: () => {
            setSavedField('recipient');
          },
        }
      );
    }
  }, [recipientBudget, budget, updateBudget]);

  // Handle blur event for purchaser budget
  const handlePurchaserBlur = React.useCallback(() => {
    if (!budget) return;

    const newValue = purchaserBudget === '' ? null : parseFloat(purchaserBudget);
    const currentValue = budget.purchaser_budget_total;

    // Only save if value changed
    if (newValue !== currentValue) {
      updateBudget.mutate(
        { purchaser_budget_total: newValue },
        {
          onSuccess: () => {
            setSavedField('purchaser');
          },
        }
      );
    }
  }, [purchaserBudget, budget, updateBudget]);

  // Loading state
  if (personLoading || budgetLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <Spinner size="lg" label="Loading budget data" />
        </div>
      </Card>
    );
  }

  // Error state - no data
  if (!person || !budget) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center min-h-[200px] text-warm-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>Unable to load budget data</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6 space-y-6', className)}>
      {/* Person Header */}
      <div className="flex items-center gap-4">
        <Avatar
          size="lg"
          ariaLabel={`${person.display_name}${person.relationship ? `, ${person.relationship}` : ''}`}
        >
          {person.photo_url && (
            <AvatarImage src={person.photo_url} alt={person.display_name} />
          )}
          <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-warm-900 truncate">
            {person.display_name}
          </h3>
          {person.relationship && (
            <p className="text-sm text-warm-600">{person.relationship}</p>
          )}
        </div>
      </div>

      {/* Budget Inputs */}
      <div className="space-y-4">
        {/* Recipient Budget Input */}
        <div className="relative">
          <Input
            type="number"
            label="Budget for Gifts to Receive"
            placeholder="0.00"
            value={recipientBudget}
            onChange={(e) => setRecipientBudget(e.target.value)}
            onBlur={handleRecipientBlur}
            disabled={updateBudget.isPending}
            step="0.01"
            min="0"
            aria-label="Budget for gifts this person will receive"
            aria-describedby="recipient-budget-help"
            className="pr-10"
          />
          <div className="absolute right-3 top-[38px] flex items-center">
            {updateBudget.isPending && savedField !== 'recipient' && (
              <Spinner size="sm" label="Saving recipient budget" />
            )}
            {savedField === 'recipient' && (
              <Check
                className="h-5 w-5 text-status-success-600"
                aria-label="Recipient budget saved"
              />
            )}
          </div>
          <p id="recipient-budget-help" className="sr-only">
            Set a budget limit for gifts this person will receive for this occasion
          </p>
        </div>

        {/* Purchaser Budget Input */}
        <div className="relative">
          <Input
            type="number"
            label="Budget for Gifts to Buy"
            placeholder="0.00"
            value={purchaserBudget}
            onChange={(e) => setPurchaserBudget(e.target.value)}
            onBlur={handlePurchaserBlur}
            disabled={updateBudget.isPending}
            step="0.01"
            min="0"
            aria-label="Budget for gifts this person will buy for others"
            aria-describedby="purchaser-budget-help"
            className="pr-10"
          />
          <div className="absolute right-3 top-[38px] flex items-center">
            {updateBudget.isPending && savedField !== 'purchaser' && (
              <Spinner size="sm" label="Saving purchaser budget" />
            )}
            {savedField === 'purchaser' && (
              <Check
                className="h-5 w-5 text-status-success-600"
                aria-label="Purchaser budget saved"
              />
            )}
          </div>
          <p id="purchaser-budget-help" className="sr-only">
            Set a budget limit for gifts this person will buy for others for this occasion
          </p>
        </div>

        {/* Error Message */}
        {updateBudget.isError && (
          <div
            className="flex items-start gap-2 p-3 bg-status-warning-50 border border-status-warning-200 rounded-medium"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 text-status-warning-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-status-warning-800">
              <p className="font-semibold">Failed to save budget</p>
              <p className="mt-1">
                {updateBudget.error instanceof Error
                  ? updateBudget.error.message
                  : 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Budget Progress Visualization */}
      <div className="pt-4 border-t border-warm-200">
        <PersonBudgetBar
          personId={personId}
          variant="modal"
          occasionId={occasionId}
          recipientBudgetTotal={
            recipientBudget === '' ? null : parseFloat(recipientBudget)
          }
          purchaserBudgetTotal={
            purchaserBudget === '' ? null : parseFloat(purchaserBudget)
          }
        />
      </div>
    </Card>
  );
}

PersonOccasionBudgetCard.displayName = 'PersonOccasionBudgetCard';
