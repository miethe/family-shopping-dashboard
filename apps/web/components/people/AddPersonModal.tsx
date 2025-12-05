/**
 * Add Person Modal Component
 *
 * Modal dialog for creating and editing persons. Supports both create and edit modes.
 * Follows the pattern from AddOccasionModal with mode switching and form pre-population.
 */

'use client';

import { useState, useEffect } from 'react';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useCreatePerson, useUpdatePerson } from '@/hooks/usePersons';
import { GroupMultiSelect } from '@/components/common/GroupMultiSelect';
import type { Person, PersonCreate, PersonUpdate, SizeEntry } from '@/types';

const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Sibling',
  'Child',
  'Extended Family',
  'Friend',
  'Colleague',
  'Other',
] as const;

const SIZE_CATEGORIES = ['shirt', 'pants', 'shoes', 'dress', 'jacket'] as const;

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (person: Person) => void;
  mode?: 'create' | 'edit';
  personToEdit?: Person | null;
}

export function AddPersonModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  personToEdit
}: AddPersonModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [notes, setNotes] = useState('');
  const [constraints, setConstraints] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [sizeProfile, setSizeProfile] = useState<SizeEntry[]>([]);
  const [newSizeType, setNewSizeType] = useState('');
  const [newSizeValue, setNewSizeValue] = useState('');
  const [groupIds, setGroupIds] = useState<number[]>([]);

  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson(personToEdit?.id || 0);
  const { toast } = useToast();

  const isEditMode = mode === 'edit';
  const isPending = isEditMode ? updateMutation.isPending : createMutation.isPending;

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && personToEdit && isOpen) {
      setDisplayName(personToEdit.display_name);
      setRelationship(personToEdit.relationship || '');
      setBirthdate(personToEdit.birthdate || '');
      setNotes(personToEdit.notes || '');
      setConstraints(personToEdit.constraints || '');
      setPhotoUrl(personToEdit.photo_url || '');
      setInterests(personToEdit.interests || []);
      setSizeProfile(personToEdit.size_profile || []);
      setGroupIds(personToEdit.groups?.map(g => g.id) || []);
    } else if (!isOpen) {
      // Reset form when modal closes
      resetForm();
    }
  }, [isEditMode, personToEdit, isOpen]);

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleAddSize = () => {
    if (newSizeType.trim() && newSizeValue.trim()) {
      setSizeProfile([
        ...sizeProfile,
        { type: newSizeType.trim(), value: newSizeValue.trim() }
      ]);
      setNewSizeType('');
      setNewSizeValue('');
    }
  };

  const handleRemoveSize = (index: number) => {
    setSizeProfile(sizeProfile.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setDisplayName('');
    setRelationship('');
    setBirthdate('');
    setNotes('');
    setConstraints('');
    setPhotoUrl('');
    setInterests([]);
    setInterestInput('');
    setSizeProfile([]);
    setNewSizeType('');
    setNewSizeValue('');
    setGroupIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) return;

    if (isEditMode && personToEdit) {
      // Update person
      const updateData: PersonUpdate = {
        display_name: displayName.trim(),
        relationship: relationship || undefined,
        birthdate: birthdate || undefined,
        notes: notes.trim() || undefined,
        constraints: constraints.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        interests: interests.length > 0 ? interests : undefined,
        size_profile: sizeProfile.length > 0 ? sizeProfile : undefined,
        group_ids: groupIds.length > 0 ? groupIds : undefined,
      };

      updateMutation.mutate(updateData, {
        onSuccess: (person) => {
          toast({
            title: 'Person updated!',
            description: `${person.display_name} has been updated.`,
            variant: 'success',
          });

          // Call callbacks
          onSuccess?.(person);
          onClose();
        },
        onError: (err: any) => {
          toast({
            title: 'Failed to update person',
            description: err.message || 'An error occurred while updating the person.',
            variant: 'error',
          });
        },
      });
    } else {
      // Create new person
      const personData: PersonCreate = {
        display_name: displayName.trim(),
        relationship: relationship || undefined,
        birthdate: birthdate || undefined,
        notes: notes.trim() || undefined,
        constraints: constraints.trim() || undefined,
        photo_url: photoUrl.trim() || undefined,
        interests: interests.length > 0 ? interests : undefined,
        size_profile: sizeProfile.length > 0 ? sizeProfile : undefined,
        group_ids: groupIds.length > 0 ? groupIds : undefined,
      };

      createMutation.mutate(personData, {
        onSuccess: (person) => {
          toast({
            title: 'Person created!',
            description: `${person.display_name} has been added.`,
            variant: 'success',
          });

          // Call callbacks
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
    }
  };

  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={handleClose}
      entityType="person"
      title={isEditMode ? "Edit Person" : "Add Person"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="e.g., Mom, Uncle Bob, Sarah"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship (optional)
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a relationship</option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Birthdate (optional)"
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            placeholder="YYYY-MM-DD"
          />

          <Input
            label="Photo URL (optional)"
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </section>

        {/* Interests Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Interests</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add interests (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
                placeholder="e.g., Photography, Cooking, Gaming"
              />
              <Button
                type="button"
                onClick={handleAddInterest}
                variant="outline"
                disabled={!interestInput.trim()}
              >
                Add
              </Button>
            </div>
            {interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(index)}
                      className="text-orange-600 hover:text-orange-800 min-h-[24px] min-w-[24px]"
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Add interests to help with gift ideas
            </p>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sizes</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add sizes (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newSizeType}
                onChange={(e) => setNewSizeType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[44px]"
              >
                <option value="">Select type...</option>
                {SIZE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
                <option value="ring">Ring</option>
                <option value="bracelet">Bracelet</option>
                <option value="hat">Hat</option>
                <option value="gloves">Gloves</option>
              </select>
              <Input
                value={newSizeValue}
                onChange={(e) => setNewSizeValue(e.target.value)}
                placeholder="Size (e.g., M, 32, 9.5)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSize();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddSize}
                variant="outline"
                disabled={!newSizeType || !newSizeValue.trim()}
                className="min-h-[44px]"
              >
                Add
              </Button>
            </div>

            {sizeProfile.length > 0 && (
              <div className="space-y-2">
                {sizeProfile.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      <span className="font-medium capitalize">{entry.type}:</span> {entry.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="text-red-600 hover:text-red-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={`Remove ${entry.type} size`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Clothing and accessory sizes for shopping reference
            </p>
          </div>
        </section>

        {/* Groups Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Groups</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to groups (optional)
            </label>
            <GroupMultiSelect
              value={groupIds}
              onChange={setGroupIds}
            />
            <p className="mt-1 text-xs text-gray-500">
              Organize people into groups (e.g., Family, Friends, Coworkers)
            </p>
          </div>
        </section>

        {/* Notes & Constraints Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="General notes about this person..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Any additional notes or preferences
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gift Constraints (optional)
            </label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g., Allergic to nuts, No electronics, Prefers sustainable products..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Important restrictions or preferences for gift selection
            </p>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="min-h-[44px] min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending || !displayName.trim()}
            className="min-h-[44px] min-w-[120px]"
          >
            {isPending
              ? (isEditMode ? 'Saving...' : 'Adding...')
              : (isEditMode ? 'Save Changes' : 'Add Person')}
          </Button>
        </div>
      </form>
    </EntityModal>
  );
}
