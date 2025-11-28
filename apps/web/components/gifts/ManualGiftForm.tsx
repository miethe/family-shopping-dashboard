/**
 * Manual Gift Form Component
 *
 * Form for manually creating a gift with all fields.
 * Used as a fallback when URL parsing fails or for custom entries.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateGift } from '@/hooks/useGifts';
import { useLists } from '@/hooks/useLists';
import { useCreateListItem } from '@/hooks/useListItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import type { GiftCreate } from '@/types';

export interface ManualGiftFormProps {
  defaultListId?: number;
}

export function ManualGiftForm({ defaultListId }: ManualGiftFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedListIds, setSelectedListIds] = useState<number[]>(
    defaultListId ? [defaultListId] : []
  );

  const { mutate, isPending } = useCreateGift();
  const { mutate: createListItem } = useCreateListItem();
  const { data: listsResponse } = useLists();
  const { toast } = useToast();
  const router = useRouter();

  const lists = listsResponse?.items ?? [];

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
    };

    mutate(giftData, {
      onSuccess: (gift) => {
        // Create list items for each selected list
        selectedListIds.forEach((listId) => {
          createListItem({
            listId,
            data: {
              gift_id: gift.id,
              status: 'idea',
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

        // Navigate to first selected list or gift detail
        if (selectedListIds.length > 0) {
          router.push(`/lists/${selectedListIds[0]}`);
        } else {
          router.push(`/gifts/${gift.id}`);
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

  return (
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
                helperText={
                  list.occasion_id || list.person_id
                    ? `${list.type} list`
                    : undefined
                }
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
  );
}
