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
import { useCreateListItem } from '@/hooks/useListItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

export interface UrlGiftFormProps {
  defaultListId?: number;
}

export function UrlGiftForm({ defaultListId }: UrlGiftFormProps) {
  const [url, setUrl] = useState('');
  const [selectedListIds, setSelectedListIds] = useState<number[]>(
    defaultListId ? [defaultListId] : []
  );

  const { mutate, isPending, error } = useGiftFromUrl();
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

    if (!url.trim()) return;

    mutate(url.trim(), {
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
          description: err.message || 'Could not parse the URL. Try adding manually.',
          variant: 'error',
        });
      },
    });
  };

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
          disabled={isPending || !url.trim()}
          className="w-full"
        >
          {isPending ? 'Parsing URL...' : 'Add Gift from URL'}
        </Button>
      </div>
    </form>
  );
}
