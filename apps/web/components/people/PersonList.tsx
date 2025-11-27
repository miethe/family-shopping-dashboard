'use client';

import { PersonCard } from './PersonCard';
import type { Person } from '@/types';

export interface PersonListProps {
  people: Person[];
}

/**
 * Person List Component
 *
 * Responsive grid of person cards:
 * - 1 column on mobile
 * - 2 columns on tablet (md)
 * - 3 columns on desktop (lg)
 * - Empty state when no people
 */
export function PersonList({ people }: PersonListProps) {
  if (people.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No people found</p>
        <p className="text-gray-400 text-sm mt-2">
          Add your first family member to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {people.map((person) => (
        <PersonCard key={person.id} person={person} />
      ))}
    </div>
  );
}
