'use client';

import * as React from 'react';
import { useState } from 'react';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOccasion } from '@/hooks/useOccasion';
import { useToast } from '@/components/ui/use-toast';
import type { OccasionCreate, OccasionType } from '@/types';

interface AddOccasionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddOccasionModal({ isOpen, onClose, onSuccess }: AddOccasionModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<OccasionType>('birthday');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const { mutate, isPending } = useCreateOccasion();
  const { toast } = useToast();

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

        // Reset form
        setName('');
        setType('birthday');
        setDate('');
        setDescription('');

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
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setType('birthday');
    setDate('');
    setDescription('');
    onClose();
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={onClose}
      entityType="occasion"
      title="Add Occasion"
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
            {isPending ? 'Creating...' : 'Create Occasion'}
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
