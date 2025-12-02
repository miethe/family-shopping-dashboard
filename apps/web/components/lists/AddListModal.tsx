/**
 * AddListModal Component
 *
 * Modal dialog for creating or editing a list with optional pre-filled context (occasion_id or person_id).
 * Supports both create and edit modes.
 * Follows mobile-first patterns with 44px touch targets and real-time integration.
 */

'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateList, useUpdateList } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { useToast } from '@/components/ui/use-toast';
import type { GiftList, ListCreate, ListUpdate, ListType, ListVisibility } from '@/types';

export interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasionId?: number;
  personId?: number;
  onSuccess?: (list: GiftList) => void;
  // Edit mode props
  listToEdit?: GiftList | null;
  mode?: 'create' | 'edit';
}

export function AddListModal({
  isOpen,
  onClose,
  occasionId,
  personId,
  onSuccess,
  listToEdit,
  mode = 'create',
}: AddListModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateList();
  const updateMutation = useUpdateList(listToEdit?.id || 0);

  // Fetch persons and occasions for dropdowns
  const { data: personsData } = usePersons();
  const { data: occasionsData } = useOccasions();

  const isEditMode = mode === 'edit' && !!listToEdit;

  const [formData, setFormData] = useState<ListCreate>({
    name: '',
    type: 'wishlist',
    visibility: 'family',
    occasion_id: occasionId,
    person_id: personId,
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data when in edit mode
  useEffect(() => {
    if (isEditMode && listToEdit) {
      setFormData({
        name: listToEdit.name,
        type: listToEdit.type,
        visibility: listToEdit.visibility,
        occasion_id: listToEdit.occasion_id,
        person_id: listToEdit.person_id,
      });
    } else if (!isEditMode) {
      // Reset to create mode defaults
      setFormData({
        name: '',
        type: 'wishlist',
        visibility: 'family',
        occasion_id: occasionId,
        person_id: personId,
      });
    }
  }, [isEditMode, listToEdit, occasionId, personId]);

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

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      person_id: value === '' ? undefined : Number(value)
    }));
  };

  const handleOccasionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      occasion_id: value === '' ? undefined : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('List name is required');
      return;
    }

    try {
      if (isEditMode) {
        // Update existing list
        const updateData: ListUpdate = {
          name: formData.name,
          type: formData.type,
          visibility: formData.visibility,
          person_id: formData.person_id,
          occasion_id: formData.occasion_id,
        };

        const updatedList = await updateMutation.mutateAsync(updateData);

        toast({
          title: 'Success',
          description: 'List updated successfully',
        });

        // Call success callback if provided
        onSuccess?.(updatedList);
      } else {
        // Create new list
        const newList = await createMutation.mutateAsync(formData);

        toast({
          title: 'Success',
          description: 'List created successfully',
        });

        // Call success callback if provided
        onSuccess?.(newList);
      }

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['lists'] });

      // Close modal and reset form
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'create'} list`;
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending && !updateMutation.isPending) {
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

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit List' : 'Create List'}</DialogTitle>
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

          <div>
            <label htmlFor="person" className="block text-sm font-medium text-gray-700 mb-1">
              For Recipient (Optional)
            </label>
            <select
              id="person"
              value={formData.person_id || ''}
              onChange={handlePersonChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="">No recipient selected</option>
              {personsData?.items?.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.display_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-1">
              For Occasion (Optional)
            </label>
            <select
              id="occasion"
              value={formData.occasion_id || ''}
              onChange={handleOccasionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
            >
              <option value="">No occasion selected</option>
              {occasionsData?.items?.map((occasion) => (
                <option key={occasion.id} value={occasion.id}>
                  {occasion.name} ({new Date(occasion.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending}
              className="flex-1 sm:flex-initial"
            >
              {isPending
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update List'
                  : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
