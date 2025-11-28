'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLists } from '@/hooks/useLists';
import { useCreateGift } from '@/hooks/useGifts';
import { useCreateListItem } from '@/hooks/useListItems';
import { useToast } from '@/components/ui/use-toast';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Quick Add Modal
 *
 * Modal for quickly capturing gift ideas and adding them to a list.
 * Features:
 * - Gift name input
 * - List selection dropdown
 * - Creates gift and list item in one flow
 * - Success/error toast notifications
 * - Mobile-responsive with 44px touch targets
 * - Keyboard accessible (Escape to close)
 */
export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const [giftName, setGiftName] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listsData } = useLists({ type: 'ideas' });
  const createGift = useCreateGift();
  const createListItem = useCreateListItem();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!giftName.trim() || !selectedListId) return;

    setIsSubmitting(true);
    try {
      // 1. Create the gift
      const gift = await createGift.mutateAsync({ name: giftName.trim() });

      // 2. Add to selected list as idea
      await createListItem.mutateAsync({
        listId: selectedListId,
        data: { gift_id: gift.id, status: 'idea' },
      });

      toast({
        title: 'Idea added!',
        description: `${giftName} was added to your ideas.`,
        variant: 'success',
      });

      // Reset and close
      setGiftName('');
      setSelectedListId(null);
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Could not add idea. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setGiftName('');
      setSelectedListId(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Idea</DialogTitle>
          <DialogDescription>
            Quickly capture a gift idea
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="What's the gift idea?"
            placeholder="e.g., Blue coffee mug"
            value={giftName}
            onChange={(e) => setGiftName(e.target.value)}
            autoFocus
            required
          />

          <div>
            <label
              htmlFor="list-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Add to list <span className="text-red-500">*</span>
            </label>
            <select
              id="list-select"
              value={selectedListId || ''}
              onChange={(e) => setSelectedListId(Number(e.target.value) || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[44px] bg-white text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              required
            >
              <option value="">Select a list...</option>
              {listsData?.items.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !giftName.trim() || !selectedListId}
              isLoading={isSubmitting}
              className="flex-1"
            >
              Add Idea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
