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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { GiftCreate } from '@/types';

export function ManualGiftForm() {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const { mutate, isPending } = useCreateGift();
  const { toast } = useToast();
  const router = useRouter();

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
        toast({
          title: 'Gift created!',
          description: `${gift.name} was added to your catalog.`,
          variant: 'success',
        });
        router.push(`/gifts/${gift.id}`);
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
