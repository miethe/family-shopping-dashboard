/**
 * URL Gift Form Component
 *
 * Form for creating a gift from a product URL.
 * Automatically parses metadata (title, image, price) from the URL.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGiftFromUrl } from '@/hooks/useGifts';
import { useLists } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useCreateListItem } from '@/hooks/useListItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
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

  const { mutate, isPending, error } = useGiftFromUrl();
  const { mutate: createListItem } = useCreateListItem();
  const { data: listsResponse } = useLists();
  const { data: personsResponse } = usePersons();
  const { data: occasionsResponse } = useOccasions();
  const { toast } = useToast();
  const router = useRouter();

  const lists = listsResponse?.items ?? [];
  const persons = personsResponse?.items ?? [];
  const occasions = occasionsResponse?.items ?? [];

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
    <form onSubmit={handleSubmit}>
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
  );
}
