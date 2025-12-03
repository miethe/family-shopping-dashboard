/**
 * Gift Edit Modal Component
 *
 * Modal for editing gift details and managing list associations.
 * Allows updating gift properties and adding/removing from lists.
 */

'use client';

import { useState, useEffect } from 'react';
import { useUpdateGift } from '@/hooks/useGift';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useListItems } from '@/hooks/useListItems';
import { useCreateListItem } from '@/hooks/useListItems';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { Gift, GiftUpdate, ListItemStatus } from '@/types';

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
  const [name, setName] = useState(gift.name);
  const [url, setUrl] = useState(gift.url || '');
  const [price, setPrice] = useState(gift.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(gift.image_url || '');
  const [status, setStatus] = useState<ListItemStatus>('idea');
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
    };

    updateGift(updateData, {
      onSuccess: (updatedGift) => {
        // Add gift to newly selected lists with the selected status
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

  const statusOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'selected', label: 'Selected' },
    { value: 'purchased', label: 'Purchased' },
    { value: 'received', label: 'Received' },
  ];

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="gift"
      title="Edit Gift"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter gift name"
        />

        <Input
          label="URL (optional)"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          helperText="Link to the product page"
        />

        <Input
          label="Price (optional)"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="29.99"
          helperText="Price in USD"
        />

        <Input
          label="Image URL (optional)"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          helperText="Direct link to product image"
        />

        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as ListItemStatus)}
          options={statusOptions}
          helperText="Status when adding to new lists"
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
