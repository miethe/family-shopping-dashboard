/**
 * PersonChip Usage Examples
 *
 * Demonstrates various use cases for the PersonChip component.
 */

'use client';

import { useState } from 'react';
import { PersonChip } from './PersonChip';
import type { Person } from '@/types';

const mockPeople: Person[] = [
  {
    id: 1,
    display_name: 'Alice Johnson',
    relationship: 'Sister',
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    display_name: 'Bob Smith',
    relationship: 'Father',
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    display_name: 'Carol Williams',
    relationship: 'Friend',
    photo_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export function PersonChipExamples() {
  const [selectedIds, setSelectedIds] = useState<number[]>([1]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <section>
        <h2 className="text-lg font-semibold mb-4">Multi-Select Example</h2>
        <div className="flex flex-wrap gap-2">
          {mockPeople.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              selected={selectedIds.includes(person.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Selected IDs: {selectedIds.join(', ') || 'None'}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Read-Only (No Toggle)</h2>
        <div className="flex flex-wrap gap-2">
          {mockPeople.map((person) => (
            <PersonChip key={person.id} person={person} selected={true} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Without Tooltips</h2>
        <div className="flex flex-wrap gap-2">
          {mockPeople.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              selected={selectedIds.includes(person.id)}
              onToggle={handleToggle}
              showTooltip={false}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Styling</h2>
        <div className="flex flex-wrap gap-2">
          {mockPeople.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              selected={selectedIds.includes(person.id)}
              onToggle={handleToggle}
              className="shadow-md hover:shadow-lg"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
