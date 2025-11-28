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
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [sizes, setSizes] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const personData: PersonCreate = {
      name: name.trim(),
      interests: interests.length > 0 ? interests : undefined,
      sizes: Object.keys(sizes).length > 0 ? sizes : undefined,
    };

    mutate(personData, {
      onSuccess: (person) => {
        toast({
          title: 'Person created!',
          description: `${person.name} has been added.`,
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter person's name"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interests (optional)
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

      <Button
        type="submit"
        isLoading={isPending}
        disabled={isPending || !name.trim()}
        className="w-full"
      >
        {isPending ? 'Adding...' : 'Add Person'}
      </Button>
    </form>
  );
}
