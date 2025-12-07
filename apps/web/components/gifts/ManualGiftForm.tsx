/**
 * Manual Gift Form Component
 *
 * Comprehensive form for manually creating a gift with all available fields.
 * Used as a fallback when URL parsing fails or for custom entries.
 *
 * Features:
 * - All gift fields: name, URL, price, image, source, description, notes
 * - Advanced fields (collapsible): priority, quantity, sale price, purchase date
 * - Multi-relationships: stores, people, additional URLs
 * - List selection with context (person, occasion)
 * - Budget context showing remaining budget for selected occasion
 * - Real-time budget projection based on price/quantity/sale price
 *
 * Layout: Main form (left) + Budget sidebar (right, when applicable)
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGift } from '@/hooks/useGifts';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useCreateListItem } from '@/hooks/useListItems';
import { useBudgetMeter } from '@/hooks/useBudgetMeter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { BudgetWarningCard } from '@/components/budget/BudgetWarningCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { UrlListInput } from '@/components/common/UrlListInput';
import { StoreMultiSelect } from '@/components/gifts/StoreMultiSelect';
import { PeopleMultiSelect } from '@/components/common/PeopleMultiSelect';
import { ImagePicker } from '@/components/ui/image-picker';
import { ChevronDown } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { GiftCreate, GiftPriority, ListItemStatus } from '@/types';

export interface ManualGiftFormProps {
  defaultListId?: number;
  onSuccess?: () => void;
}

const GIFT_SOURCES = ['Amazon', 'Target', 'Etsy', 'Other'] as const;

export function ManualGiftForm({ defaultListId, onSuccess }: ManualGiftFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<GiftPriority>('medium' as GiftPriority);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [additionalUrls, setAdditionalUrls] = useState<{ label: string; url: string }[]>([]);
  const [storeIds, setStoreIds] = useState<number[]>([]);
  const [personIds, setPersonIds] = useState<number[]>([]);
  const [status, setStatus] = useState<ListItemStatus>('idea');
  const [selectedListIds, setSelectedListIds] = useState<number[]>(
    defaultListId ? [defaultListId] : []
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { mutate, isPending } = useCreateGift();
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

  // Calculate budget projections - use sale price if available, otherwise regular price
  const effectivePrice = salePrice ? parseFloat(salePrice) : (price ? parseFloat(price) : 0);
  const giftPrice = effectivePrice * quantity;
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

    if (!name.trim()) return;

    const giftData: GiftCreate = {
      name: name.trim(),
      url: url.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      image_url: imageUrl.trim() || undefined,
      source: source.trim() || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      priority: priority,
      quantity: quantity,
      sale_price: salePrice ? parseFloat(salePrice) : undefined,
      purchase_date: purchaseDate || undefined,
      additional_urls: additionalUrls.length > 0 ? additionalUrls : undefined,
      store_ids: storeIds.length > 0 ? storeIds : undefined,
      person_ids: personIds.length > 0 ? personIds : undefined,
    };

    mutate(giftData, {
      onSuccess: (gift) => {
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
          description: err.message || 'An error occurred while creating the gift.',
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

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        {/* Name Input */}
        <Input
          label="Gift Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., LEGO Star Wars Set"
          disabled={isPending}
        />

        {/* URL Input */}
        <Input
          label="Product URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          helperText="Optional - link to product page"
          disabled={isPending}
        />

        {/* Price Input */}
        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          helperText="Optional - estimated or actual price"
          disabled={isPending}
        />

        {/* Gift Image Picker */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
            Gift Image
          </label>
          <ImagePicker
            value={imageUrl || null}
            onChange={(url) => setImageUrl(url || '')}
            onError={(error) => {
              toast({
                title: 'Image upload failed',
                description: error,
                variant: 'error',
              });
            }}
            disabled={isPending}
          />
          <p className="mt-1.5 text-xs text-warm-600">
            Optional - upload or link to product image
          </p>
        </div>

        {/* People Multi-Select */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
            For...
          </label>
          <PeopleMultiSelect
            value={personIds}
            onChange={(ids) => setPersonIds(ids)}
          />
          <p className="mt-1.5 text-xs text-warm-600">
            Optional - who is this gift for
          </p>
        </div>

        {/* Source Dropdown */}
        <div>
          <label htmlFor="source" className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
            Source
          </label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isPending}
            className={cn(
              'w-full px-4 py-3 bg-white text-base text-warm-900 font-normal',
              'min-h-[44px]',
              'border-2 border-border-medium rounded-medium shadow-subtle',
              'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
              'transition-all duration-200 ease-out',
              'disabled:bg-warm-100 disabled:text-warm-500 disabled:border-warm-300 disabled:cursor-not-allowed'
            )}
          >
            <option value="">Select a source (optional)</option>
            {GIFT_SOURCES.map((sourceOption) => (
              <option key={sourceOption} value={sourceOption}>
                {sourceOption}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-warm-600">
            Optional - where to purchase this gift
          </p>
        </div>

        {/* Description Textarea */}
        <Textarea
          label="Description"
          placeholder="Describe the gift..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          helperText="Optional - detailed description of the gift"
          disabled={isPending}
        />

        {/* Advanced Options - Collapsible */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-between w-full px-4 py-3 text-sm font-semibold',
                'bg-warm-50 border-2 border-border-medium rounded-medium',
                'hover:bg-warm-100 transition-colors',
                'min-h-[44px]'
              )}
            >
              <span className="uppercase tracking-wide text-warm-800">
                Advanced Options
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  showAdvanced && 'transform rotate-180'
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Notes Textarea (internal) */}
            <Textarea
              label="Notes (Internal)"
              placeholder="Private notes about this gift..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              helperText="Optional - private notes for your reference only"
              disabled={isPending}
            />

            {/* Priority & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={priority}
                onChange={(value) => setPriority(value as GiftPriority)}
                options={priorityOptions}
                disabled={isPending}
              />
              <Input
                label="Quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                helperText="How many items"
                disabled={isPending}
              />
            </div>

            {/* Sale Price */}
            <Input
              label="Sale Price"
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              helperText="Optional - discounted or sale price"
              disabled={isPending}
            />

            {/* Purchase Date */}
            <Input
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              helperText="Optional - when the gift was purchased"
              disabled={isPending}
            />

            {/* Additional URLs */}
            <UrlListInput
              label="Additional URLs"
              value={additionalUrls}
              onChange={(urls) => setAdditionalUrls(urls)}
              helperText="Add more product links or references"
              disabled={isPending}
            />

            {/* Stores Multi-Select */}
            <StoreMultiSelect
              label="Stores"
              value={storeIds}
              onChange={(ids) => setStoreIds(ids)}
              helperText="Select stores where this gift can be purchased"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Status Select */}
        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as ListItemStatus)}
          options={statusOptions}
          helperText="Current status of this gift idea"
          disabled={isPending}
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
          disabled={isPending || !name.trim()}
          className="w-full"
        >
          {isPending ? 'Adding...' : 'Add Gift'}
        </Button>
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

                {/* Projected Remaining (only if price entered) */}
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
                Budget updates are shown in real-time as you enter the gift price.
                This is informational only and won&apos;t prevent you from adding the gift.
              </p>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
