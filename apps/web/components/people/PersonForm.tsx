/**
 * Person Form Component
 *
 * Form for creating or editing a person with complete demographic and
 * relationship information. Handles all PersonCreate/PersonUpdate fields.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePerson } from '@/hooks/usePersons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePicker } from '@/components/ui/image-picker';
import { useToast } from '@/components/ui/use-toast';
import type { PersonCreate } from '@/types';

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

export function PersonForm() {
  const [displayName, setDisplayName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [notes, setNotes] = useState('');
  const [constraints, setConstraints] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [sizeKey, setSizeKey] = useState('');
  const [sizeValue, setSizeValue] = useState('');

  const { mutate, isPending } = useCreatePerson();
  const { toast } = useToast();
  const router = useRouter();

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
    if (sizeKey.trim() && sizeValue.trim()) {
      setSizes({ ...sizes, [sizeKey.trim()]: sizeValue.trim() });
      setSizeKey('');
      setSizeValue('');
    }
  };

  const handleRemoveSize = (key: string) => {
    const { [key]: _, ...rest } = sizes;
    setSizes(rest);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) return;

    const personData: PersonCreate = {
      display_name: displayName.trim(),
      relationship: relationship || undefined,
      birthdate: birthdate || undefined,
      notes: notes.trim() || undefined,
      constraints: constraints.trim() || undefined,
      photo_url: photoUrl.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined,
      sizes: Object.keys(sizes).length > 0 ? sizes : undefined,
    };

    mutate(personData, {
      onSuccess: (person) => {
        toast({
          title: 'Person created!',
          description: `${person.display_name} has been added.`,
          variant: 'success',
        });
        router.push(`/people/${person.id}`);
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

  return (
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
            disabled={isPending}
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload or link to a photo of this person
          </p>
        </div>
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
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index)}
                    className="text-blue-600 hover:text-blue-800"
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
              value={sizeKey}
              onChange={(e) => setSizeKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Category</option>
              {SIZE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>
            {sizeKey === 'custom' && (
              <Input
                value={sizeKey}
                onChange={(e) => setSizeKey(e.target.value)}
                placeholder="Size category"
                className="flex-1"
              />
            )}
            <Input
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value)}
              placeholder="Size value (e.g., M, 32, 9.5)"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSize}
              variant="outline"
              disabled={!sizeKey || !sizeValue.trim()}
            >
              Add
            </Button>
          </div>
          {Object.keys(sizes).length > 0 && (
            <div className="space-y-2">
              {Object.entries(sizes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">
                    <span className="font-medium capitalize">{key}:</span> {String(value)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(key)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Remove ${key} size`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Clothing sizes for shopping reference
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Important restrictions or preferences for gift selection
          </p>
        </div>
      </section>

      <Button
        type="submit"
        isLoading={isPending}
        disabled={isPending || !displayName.trim()}
        className="w-full"
      >
        {isPending ? 'Adding...' : 'Add Person'}
      </Button>
    </form>
  );
}
