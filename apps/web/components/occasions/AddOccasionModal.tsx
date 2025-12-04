'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { useCreateOccasion, useUpdateOccasion } from '@/hooks/useOccasions';
import { useToast } from '@/components/ui/use-toast';
import type { Occasion, OccasionCreate, OccasionUpdate, OccasionType } from '@/types';

interface AddOccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  occasionToEdit?: Occasion;
}

export function AddOccasionModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  occasionToEdit
}: AddOccasionModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<OccasionType>('birthday');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number | null>(null);

  const createMutation = useCreateOccasion();
  const updateMutation = useUpdateOccasion(occasionToEdit?.id || 0);
  const { toast } = useToast();

  const isEditMode = mode === 'edit';
  const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && occasionToEdit && isOpen) {
      setName(occasionToEdit.name);
      setType(occasionToEdit.type);
      setDate(occasionToEdit.date);
      setDescription(occasionToEdit.description || '');
      setBudget(occasionToEdit.budget ?? null);
    } else if (!isOpen) {
      // Reset form when modal closes
      setName('');
      setType('birthday');
      setDate('');
      setDescription('');
      setBudget(null);
    }
  }, [isEditMode, occasionToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !date) {
      return;
    }

    if (isEditMode && occasionToEdit) {
      // Update occasion
      const updateData: OccasionUpdate = {
        name: name.trim(),
        type,
        date,
        description: description.trim() || undefined,
        budget: budget,
      };

      updateMutation.mutate(updateData, {
        onSuccess: (occasion) => {
          toast({
            title: 'Occasion updated!',
            description: `${occasion.name} has been updated.`,
            variant: 'success',
          });

          // Call callbacks
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          toast({
            title: 'Failed to update occasion',
            description: err.message || 'An error occurred while updating the occasion.',
            variant: 'error',
          });
        },
      });
    } else {
      // Create new occasion
      const occasionData: OccasionCreate = {
        name: name.trim(),
        type,
        date,
        description: description.trim() || undefined,
        budget: budget,
      };

      createMutation.mutate(occasionData, {
        onSuccess: (occasion) => {
          toast({
            title: 'Occasion created!',
            description: `${occasion.name} has been added.`,
            variant: 'success',
          });

          // Call callbacks
          onSuccess?.();
          onClose();
        },
        onError: (err: any) => {
          toast({
            title: 'Failed to create occasion',
            description: err.message || 'An error occurred while creating the occasion.',
            variant: 'error',
          });
        },
      });
    }
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setType('birthday');
    setDate('');
    setDescription('');
    setBudget(null);
    onClose();
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="occasion"
      title={isEditMode ? "Edit Occasion" : "Add Occasion"}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isPending}
            disabled={isPending || !name.trim() || !date}
          >
            {isPending
              ? (isEditMode ? 'Saving...' : 'Creating...')
              : (isEditMode ? 'Save Changes' : 'Create Occasion')}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter occasion name"
          disabled={isPending}
        />

        <div>
          <label className="block text-sm font-medium text-warm-900 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as OccasionType)}
            disabled={isPending}
            className="w-full px-3 py-2 border border-warm-300 rounded-medium text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
          disabled={isPending}
        />

        <div>
          <CurrencyInput
            label="Budget"
            value={budget}
            onChange={setBudget}
            placeholder="0.00"
            helperText="Optional: Set a spending limit for this occasion"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-warm-900 mb-2">
            Description
            <span className="text-warm-400 ml-1">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this occasion"
            disabled={isPending}
            className="w-full px-3 py-2 border border-warm-300 rounded-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[100px]"
          />
        </div>
      </form>
    </EntityModal>
  );
}
