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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function UrlGiftForm() {
  const [url, setUrl] = useState('');
  const { mutate, isPending, error } = useGiftFromUrl();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    mutate(url.trim(), {
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
