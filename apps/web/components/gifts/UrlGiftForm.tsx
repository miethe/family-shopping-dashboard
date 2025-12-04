/**
 * URL Gift Form Component
 *
 * Form for creating a gift from a product URL.
 * Automatically parses metadata (title, image, price) from the URL.
 * Now includes budget context showing remaining budget for selected occasion.
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGiftFromUrl } from '@/hooks/useGifts';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useCreateListItem } from '@/hooks/useListItems';
import { useBudgetMeter } from '@/hooks/useBudgetMeter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BudgetWarningCard } from '@/components/budget/BudgetWarningCard';
import type { ListItemStatus } from '@/types';

export interface UrlGiftFormProps {
  defaultListId?: number;
  onSuccess?: () => void;
}

export function UrlGiftForm({ defaultListId, onSuccess }: UrlGiftFormProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ListItemStatus>('idea');
  const [selectedListIds, setSelectedListIds] = useState<number[]>(
    defaultListId ? [defaultListId] : []
  );
  const [parsedPrice, setParsedPrice] = useState<number | null>(null);

  const { mutate, isPending, error } = useGiftFromUrl();
  const { mutate: createListItem } = useCreateListItem();
  const { data: listsResponse } = useLists();
  const { data: personsResponse } = usePersons();
  const { data: occasionsResponse } = useOccasions();
  const { toast } = useToast();
  const router = useRouter();

  const lists = useMemo(() => listsResponse?.items ?? [], [listsResponse?.items]);
  const persons = useMemo(() => personsResponse?.items ?? [], [personsResponse?.items]);
  const occasions = useMemo(() => occasionsResponse?.items ?? [], [occasionsResponse?.items]);

  // Get occasion ID from selected lists (use first selected list's occasion)
  const occasionId = useMemo(() => {
    if (selectedListIds.length === 0) return undefined;
    const firstList = lists.find((list) => list.id === selectedListIds[0]);
    return firstList?.occasion_id || undefined;
  }, [selectedListIds, lists]);

  // Fetch budget data for the occasion
  const { data: budgetData } = useBudgetMeter(occasionId);

  // Calculate budget projections
  const giftPrice = parsedPrice || 0;
  const currentSpent = budgetData
    ? budgetData.purchased_amount + budgetData.planned_amount
    : 0;
  const remaining = budgetData?.remaining_amount ?? null;
  const projectedRemaining = remaining !== null ? remaining - giftPrice : null;
  const wouldExceedBudget = projectedRemaining !== null && projectedRemaining < 0;

  // Helper to get list context description
  const getListContext = (list: typeof lists[0]) => {
    const parts: string[] = [];

    if (list.person_id) {
      const person = persons.find((p) => p.id === list.person_id);
      if (person) parts.push(`for ${person.display_name}`);
    }

    if (list.occasion_id) {
      const occasion = occasions.find((o) => o.id === list.occasion_id);
      if (occasion) parts.push(`(${occasion.name})`);
    }

    return parts.length > 0 ? parts.join(' ') : `${list.type} list`;
  };

  const toggleListSelection = (listId: number) => {
    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    mutate(url.trim(), {
      onSuccess: (gift) => {
        // Store parsed price for budget preview
        setParsedPrice(gift.price || null);

        // Create list items for each selected list with the selected status
        selectedListIds.forEach((listId) => {
          createListItem({
            listId,
            data: {
              gift_id: gift.id,
              status: status,
            },
          });
        });

        toast({
          title: 'Gift created!',
          description: `${gift.name} was added to your catalog${
            selectedListIds.length > 0 ? ` and ${selectedListIds.length} list(s)` : ''
          }.`,
          variant: 'success',
        });

        // Call onSuccess callback if provided, otherwise navigate
        if (onSuccess) {
          onSuccess();
        } else {
          // Navigate to first selected list or gift detail
          if (selectedListIds.length > 0) {
            router.push(`/lists/${selectedListIds[0]}`);
          } else {
            router.push(`/gifts/${gift.id}`);
          }
        }
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to create gift',
          description: err.message || 'Could not parse the URL. Try adding manually.',
          variant: 'error',
        });
      },
    });
  };

  const statusOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'selected', label: 'Selected' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'received', label: 'Received' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="space-y-4">
          <Input
            type="url"
            label="Product URL"
            placeholder="https://www.amazon.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            helperText="We'll try to automatically extract the title, image, and price."
            error={error ? (error as any).message : undefined}
          />

          <Select
            label="Status"
            value={status}
            onChange={(value) => setStatus(value as ListItemStatus)}
            options={statusOptions}
            helperText="Current status of this gift idea"
          />

          {/* List Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
              Add to Lists (optional)
            </label>
            {lists.length === 0 ? (
              <p className="text-sm text-warm-600">
                No lists available. Create a list first to add gifts to it.
              </p>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto border border-border-light rounded-medium p-3 bg-warm-50">
                {lists.map((list) => (
                  <Checkbox
                    key={list.id}
                    id={`list-${list.id}`}
                    checked={selectedListIds.includes(list.id)}
                    onChange={() => toggleListSelection(list.id)}
                    label={list.name}
                    helperText={getListContext(list)}
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending || !url.trim()}
            className="w-full"
          >
            {isPending ? 'Parsing URL...' : 'Add Gift from URL'}
          </Button>
        </div>
      </form>

      {/* Budget Context Sidebar */}
      {budgetData?.has_budget && occasionId && (
        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-warm-50 border-2 border-border-light rounded-lg p-4 sticky top-4">
            <h4 className="font-semibold text-sm text-warm-900 mb-4 uppercase tracking-wide">
              Budget Context
            </h4>

            <div className="space-y-3">
              {/* Budget Overview */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-warm-600">Total budget:</span>
                  <span className="font-semibold text-warm-900">
                    ${budgetData.budget_total?.toFixed(2) ?? '0.00'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-warm-600">Spent so far:</span>
                  <span className="font-medium text-green-600">
                    ${currentSpent.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline border-t border-border-medium pt-2">
                  <span className="text-warm-600">Remaining:</span>
                  <span className="font-semibold text-primary-600">
                    ${remaining?.toFixed(2) ?? '0.00'}
                  </span>
                </div>

                {/* Projected Remaining (only if price parsed or entered) */}
                {giftPrice > 0 && projectedRemaining !== null && (
                  <div className="flex justify-between items-baseline border-t border-border-medium pt-2 mt-2">
                    <span className="text-warm-700 font-medium">After this gift:</span>
                    <span
                      className={`font-bold ${
                        projectedRemaining < 0
                          ? 'text-red-600'
                          : projectedRemaining < (remaining || 0) * 0.2
                          ? 'text-orange-600'
                          : 'text-primary-600'
                      }`}
                    >
                      ${projectedRemaining.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Visual Progress Bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs text-warm-600 mb-1">
                  <span>Progress</span>
                  <span>
                    {budgetData.purchased_percent.toFixed(0)}% spent
                  </span>
                </div>
                <div className="h-2 bg-warm-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${Math.min(budgetData.purchased_percent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Budget Warning */}
              {wouldExceedBudget && (
                <BudgetWarningCard
                  warning={{
                    level: 'exceeded',
                    message: `This gift would exceed budget by $${Math.abs(projectedRemaining!).toFixed(2)}`,
                    threshold_percent: 100,
                    current_percent:
                      ((currentSpent + giftPrice) / (budgetData.budget_total || 1)) * 100,
                  }}
                  className="mt-3"
                />
              )}

              {/* Info Note */}
              <p className="text-xs text-warm-600 pt-2 border-t border-border-medium">
                {giftPrice > 0
                  ? 'Budget projection shown based on parsed price from URL.'
                  : 'Budget projection will appear once the gift price is parsed from the URL.'}
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
