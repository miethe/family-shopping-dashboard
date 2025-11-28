/**
 * AddListModal Component
 *
 * Modal dialog for creating a new list with optional pre-filled context (occasion_id or person_id).
 * Follows mobile-first patterns with 44px touch targets and real-time integration.
 */

'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateList } from '@/hooks/useLists';
import type { GiftList, ListCreate, ListType, ListVisibility } from '@/types';

export interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasionId?: number;
  personId?: number;
  onSuccess?: (list: GiftList) => void;
}

export function AddListModal({
  isOpen,
  onClose,
  occasionId,
  personId,
  onSuccess,
}: AddListModalProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateList();

  const [formData, setFormData] = useState<ListCreate>({
    name: '',
    type: 'wishlist',
    visibility: 'family',
    occasion_id: occasionId,
    person_id: personId,
  });

  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    setError(null);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, type: e.target.value as ListType }));
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, visibility: e.target.value as ListVisibility }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('List name is required');
      return;
    }

    try {
      const newList = await createMutation.mutateAsync(formData);

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['lists'] });

      // Call success callback if provided
      onSuccess?.(newList);

      // Close modal and reset form
      onClose();
      setFormData({
        name: '',
        type: 'wishlist',
        visibility: 'family',
        occasion_id: occasionId,
        person_id: personId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create list';
      setError(message);
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setError(null);
      setFormData({
        name: '',
        type: 'wishlist',
        visibility: 'family',
        occasion_id: occasionId,
        person_id: personId,
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Birthday Gifts"
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="wishlist">Wishlist</option>
              <option value="ideas">Ideas</option>
              <option value="assigned">Assigned</option>
            </select>
          </div>

          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              id="visibility"
              value={formData.visibility}
              onChange={handleVisibilityChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="private">Private</option>
              <option value="family">Family</option>
              <option value="public">Public</option>
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              {createMutation.isPending ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
