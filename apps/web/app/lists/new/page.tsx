/**
 * New List Page
 *
 * Allows users to create a new gift list with configurable type, visibility,
 * and optional associations to a person or occasion.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreateList } from '@/hooks/useLists';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import type { ListCreate, ListType, ListVisibility } from '@/types';

export default function NewListPage() {
  const router = useRouter();
  const createMutation = useCreateList();
  const { data: personsData } = usePersons();
  const { data: occasionsData } = useOccasions();

  const [formData, setFormData] = useState<ListCreate>({
    name: '',
    type: 'wishlist',
    visibility: 'family',
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

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      person_id: value ? parseInt(value, 10) : undefined,
    }));
  };

  const handleOccasionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      occasion_id: value ? parseInt(value, 10) : undefined,
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
      const newList = await createMutation.mutateAsync(formData);
      router.push(`/lists/${newList.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create list';
      setError(message);
    }
  };

  const persons = personsData?.items || [];
  const occasions = occasionsData?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create List"
        subtitle="Create a new gift list"
        backHref="/lists"
      />

      <Card className="max-w-lg mx-auto">
        <CardContent className="p-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="private">Private</option>
                <option value="family">Family</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div>
              <label htmlFor="person" className="block text-sm font-medium text-gray-700 mb-1">
                Person (Optional)
              </label>
              <select
                id="person"
                value={formData.person_id || ''}
                onChange={handlePersonChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a person</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-1">
                Occasion (Optional)
              </label>
              <select
                id="occasion"
                value={formData.occasion_id || ''}
                onChange={handleOccasionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an occasion</option>
                {occasions.map((occasion) => (
                  <option key={occasion.id} value={occasion.id}>
                    {occasion.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 min-h-[44px]"
              >
                {createMutation.isPending ? 'Creating...' : 'Create List'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 min-h-[44px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
