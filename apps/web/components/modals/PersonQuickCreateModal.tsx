/**
 * PersonQuickCreateModal Component
 *
 * Simplified inline person creation modal for use within PersonDropdown.
 * Focuses on essential fields only (name, relationship, photo).
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import * as React from 'react';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePicker } from '@/components/ui/image-picker';
import { useToast } from '@/components/ui/use-toast';
import { useCreatePerson } from '@/hooks/usePersons';
import type { Person, PersonCreate } from '@/types';

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Sibling',
  'Child',
  'Extended Family',
  'Friend',
  'Colleague',
  'Other',
] as const;

interface PersonQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (person: Person) => void;
}

/**
 * PersonQuickCreateModal
 *
 * Quick inline form for creating a new person with minimal fields.
 * Used by PersonDropdown "Add New Person" action.
 */
export function PersonQuickCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: PersonQuickCreateModalProps) {
  const [displayName, setDisplayName] = React.useState('');
  const [relationship, setRelationship] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');

  const createMutation = useCreatePerson();
  const { toast } = useToast();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setDisplayName('');
      setRelationship('');
      setPhotoUrl('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) return;

    const personData: PersonCreate = {
      display_name: displayName.trim(),
      relationship: relationship || undefined,
      photo_url: photoUrl.trim() || undefined,
    };

    createMutation.mutate(personData, {
      onSuccess: (person) => {
        toast({
          title: 'Person created!',
          description: `${person.display_name} has been added.`,
          variant: 'success',
        });

        // Call success callback
        onSuccess?.(person);
        onClose();
      },
      onError: (err: any) => {
        toast({
          title: 'Failed to create person',
          description: err.message || 'An error occurred while creating the person.',
          variant: 'error',
        });
      },
    });
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onClose();
    }
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={handleClose}
      entityType="person"
      title="Add New Person"
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-warm-600">
          Create a new person quickly. You can add more details later.
        </p>

        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder="e.g., Mom, Uncle Bob, Sarah"
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide mb-2">
            Relationship (optional)
          </label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full px-4 py-3 min-h-[44px] border border-border-light rounded-medium text-warm-900 bg-warm-50 text-sm focus:outline-none focus:ring-2 focus:ring-warm-200 focus:border-warm-400 transition-all duration-200"
          >
            <option value="">Select a relationship</option>
            {RELATIONSHIP_OPTIONS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide mb-2">
            Photo (optional)
          </label>
          <ImagePicker
            value={photoUrl || null}
            onChange={(url) => setPhotoUrl(url || '')}
            onError={(error) => {
              toast({
                title: 'Image upload failed',
                description: error,
                variant: 'error',
              });
            }}
            disabled={createMutation.isPending}
          />
          <p className="mt-1 text-xs text-warm-600">
            Upload or link to a photo of this person
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-warm-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="min-h-[44px] min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending || !displayName.trim()}
            className="min-h-[44px] min-w-[120px]"
          >
            {createMutation.isPending ? 'Adding...' : 'Add Person'}
          </Button>
        </div>
      </form>
    </EntityModal>
  );
}
