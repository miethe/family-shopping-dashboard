/**
 * Person Form Component
 *
 * Form for creating or editing a person with basic demographic and
 * relationship information. Handles all PersonCreate/PersonUpdate fields.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePerson } from '@/hooks/usePersons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { PersonCreate } from '@/types';

export function PersonForm() {
  const [displayName, setDisplayName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [notes, setNotes] = useState('');
  const [interests, setInterests] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const { mutate, isPending } = useCreatePerson();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) return;

    const personData: PersonCreate = {
      display_name: displayName.trim(),
      relationship: relationship.trim() || undefined,
      birthdate: birthdate || undefined,
      notes: notes.trim() || undefined,
      interests: interests.trim() || undefined,
      photo_url: photoUrl.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        placeholder="Enter person's name"
      />

      <Input
        label="Relationship (optional)"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
        placeholder="e.g., Sister, Aunt, Friend"
        helperText="How are they related to you?"
      />

      <Input
        label="Birthdate (optional)"
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
        helperText="YYYY-MM-DD format"
      />

      <Input
        label="Photo URL (optional)"
        type="url"
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="https://..."
        helperText="Direct link to photo"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interests (optional)
        </label>
        <textarea
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g., Photography, Cooking, Gaming"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500">
          List their interests to help with gift ideas
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any other details to remember..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
      </div>

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
