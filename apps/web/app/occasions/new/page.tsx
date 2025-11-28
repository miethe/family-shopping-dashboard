/**
 * New Occasion Page
 *
 * Allows users to create a new occasion with name, type, date, and optional description.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOccasion } from '@/hooks/useOccasion';
import { useToast } from '@/components/ui/use-toast';
import type { OccasionCreate, OccasionType } from '@/types';

export default function NewOccasionPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState<OccasionType>('birthday');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const { mutate, isPending } = useCreateOccasion();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      return;
    }

    const occasionData: OccasionCreate = {
      name: name.trim(),
      type,
      date,
      description: description.trim() || undefined,
    };

    mutate(occasionData, {
      onSuccess: (occasion) => {
        toast({
          title: 'Occasion created!',
          description: `${occasion.name} has been added.`,
          variant: 'success',
        });
        router.push('/occasions');
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to create occasion',
          description: err.message || 'An error occurred while creating the occasion.',
          variant: 'error',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Occasion"
        subtitle="Create a new occasion"
        backHref="/occasions"
      />

      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter occasion name"
            />

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OccasionType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[44px]"
              >
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              helperText="When is this occasion?"
            />

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
                <span className="text-gray-400 ml-1">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this occasion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending || !name.trim() || !date}
              className="w-full"
            >
              {isPending ? 'Creating...' : 'Create Occasion'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
