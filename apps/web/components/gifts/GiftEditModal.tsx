/**
 * Gift Edit Modal Component
 *
 * Modal for editing gift details and managing list associations.
 * Allows updating gift properties and adding/removing from lists.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUpdateGift } from '@/hooks/useGift';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useListItems } from '@/hooks/useListItems';
import { useCreateListItem } from '@/hooks/useListItems';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { StatusSelector } from '@/components/ui/status-selector';
import { ImagePicker } from '@/components/ui/image-picker';
import { UrlListInput } from '@/components/common/UrlListInput';
import { StoreMultiSelect } from '@/components/gifts/StoreMultiSelect';
import { PeopleMultiSelect } from '@/components/common/PeopleMultiSelect';
import { useToast } from '@/components/ui/use-toast';
import type { Gift, GiftUpdate, GiftPriority, GiftStatus, ListItemStatus } from '@/types';

export interface GiftEditModalProps {
  gift: Gift;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GiftEditModal({
  gift,
  isOpen,
  onClose,
  onSuccess,
}: GiftEditModalProps) {
  // Basic fields
  const [name, setName] = useState(gift.name);
  const [url, setUrl] = useState(gift.url || '');
  const [price, setPrice] = useState(gift.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(gift.image_url || '');
  const [source, setSource] = useState(gift.source || '');

  // New fields
  const [description, setDescription] = useState(gift.description || '');
  const [notes, setNotes] = useState(gift.notes || '');
  const [priority, setPriority] = useState<GiftPriority>(gift.priority);
  const [giftStatus, setGiftStatus] = useState<GiftStatus>(gift.status);
  const [quantity, setQuantity] = useState(gift.quantity || 1);
  const [salePrice, setSalePrice] = useState(gift.sale_price?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState(gift.purchase_date || '');
  const [additionalUrls, setAdditionalUrls] = useState(gift.additional_urls || []);
  const [storeIds, setStoreIds] = useState(gift.stores?.map(s => s.id) || []);
  const [personIds, setPersonIds] = useState(gift.person_ids || []);

  // List association fields
  const [listItemStatus, setListItemStatus] = useState<ListItemStatus>('idea');
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);

  const { mutate: updateGift, isPending: isUpdating } = useUpdateGift(gift.id);
  const { mutate: createListItem } = useCreateListItem();
  const { data: listsResponse } = useLists(undefined, { enabled: isOpen });
  const { data: personsResponse } = usePersons(undefined, { enabled: isOpen });
  const { data: occasionsResponse } = useOccasions(undefined, { enabled: isOpen });
  const { toast } = useToast();

  const lists = useMemo(() => listsResponse?.items ?? [], [listsResponse?.items]);
  const persons = personsResponse?.items ?? [];
  const occasions = occasionsResponse?.items ?? [];

  // Load current list associations when modal opens
  // Note: Since we don't have a gift_id filter API yet, we'll fetch all lists
  // and check which ones contain this gift. For V1 with 2-3 users, this is acceptable.
  useEffect(() => {
    if (isOpen && lists.length > 0) {
      // Check each list for this gift (will need to query list items)
      // For now, we'll just initialize as empty and let user select
      setSelectedListIds([]);
    }
  }, [isOpen, lists, gift.id]);

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

    const updateData: GiftUpdate = {
      name: name.trim(),
      url: url.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      image_url: imageUrl.trim() || undefined,
      source: source.trim() || undefined,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      priority: priority,
      status: giftStatus,
      quantity: quantity,
      sale_price: salePrice ? parseFloat(salePrice) : undefined,
      purchase_date: purchaseDate || undefined,
      additional_urls: additionalUrls,
      store_ids: storeIds,
      person_ids: personIds,
    };

    updateGift(updateData, {
      onSuccess: (updatedGift) => {
        // Add gift to newly selected lists with the selected list item status
        selectedListIds.forEach((listId) => {
          createListItem({
            listId,
            data: {
              gift_id: gift.id,
              status: listItemStatus,
            },
          });
        });

        toast({
          title: 'Gift updated!',
          description: `${updatedGift.name} has been updated successfully.`,
          variant: 'success',
        });

        onSuccess?.();
        onClose();
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to update gift',
          description: err.message || 'An error occurred while updating the gift.',
          variant: 'error',
        });
      },
    });
  };

  const listItemStatusOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'selected', label: 'Selected' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'received', label: 'Received' },
  ];

  const GIFT_SOURCES = ['Amazon', 'Target', 'Etsy', 'Other'] as const;

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="gift"
      title="Edit Gift"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <Input
          label="Gift Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., LEGO Star Wars Set"
        />

        {/* URL Input */}
        <Input
          label="Product URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          helperText="Optional - link to product page"
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
        />

        {/* Gift Status - positioned between Price and URL per design spec */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
            Gift Status
          </label>
          <StatusSelector
            status={giftStatus as 'idea' | 'selected' | 'purchased' | 'received'}
            onChange={(value) => setGiftStatus(value as GiftStatus)}
            size="md"
            disabled={isUpdating}
          />
          <p className="mt-1.5 text-xs text-warm-600">
            Overall status of this gift
          </p>
        </div>

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
            disabled={isUpdating}
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
            onChange={setPersonIds}
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
            disabled={isUpdating}
            className="w-full px-4 py-3 bg-white text-base text-warm-900 font-normal min-h-[44px] border-2 border-border-medium rounded-medium shadow-subtle focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 ease-out disabled:bg-warm-100 disabled:text-warm-500 disabled:border-warm-300 disabled:cursor-not-allowed"
          >
            <option value="">Select a source (optional)</option>
            {GIFT_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
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
          disabled={isUpdating}
        />

        {/* Notes Textarea (internal) */}
        <Textarea
          label="Notes (Internal)"
          placeholder="Private notes about this gift..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          helperText="Optional - private notes for your reference only"
          disabled={isUpdating}
        />

        {/* Priority */}
        <Select
          label="Priority"
          value={priority}
          onChange={(value) => setPriority(value as GiftPriority)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          disabled={isUpdating}
        />

        {/* Quantity */}
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          helperText="How many items"
          disabled={isUpdating}
        />

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
          disabled={isUpdating}
        />

        {/* Purchase Date */}
        <Input
          label="Purchase Date"
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          helperText="Optional - when the gift was purchased"
          disabled={isUpdating}
        />

        {/* Additional URLs */}
        <UrlListInput
          label="Additional URLs"
          value={additionalUrls}
          onChange={setAdditionalUrls}
          helperText="Add more product links or references"
          disabled={isUpdating}
        />

        {/* Stores Multi-Select */}
        <StoreMultiSelect
          label="Stores"
          value={storeIds}
          onChange={setStoreIds}
          stores={gift.stores}
          helperText="Select stores where this gift can be purchased"
        />

        {/* Divider */}
        <div className="border-t-2 border-border-light my-6" />

        {/* List Management Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-warm-900 uppercase tracking-wide">
            List Management
          </h3>

          <Select
            label="List Item Status"
            value={listItemStatus}
            onChange={(value) => setListItemStatus(value as ListItemStatus)}
            options={listItemStatusOptions}
            helperText="Status when adding to new lists below"
          />

          {/* List Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
              Add to Lists (optional)
            </label>
          <p className="text-xs text-warm-600">
            Select lists to add this gift to. To remove from lists, visit the list page.
          </p>
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
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isUpdating}
            disabled={isUpdating || !name.trim()}
            className="flex-1"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </EntityModal>
  );
}
