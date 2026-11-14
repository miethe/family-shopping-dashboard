/**
 * PersonMultiSelect Component
 *
 * Multi-select interface for choosing people.
 * Inverse of GroupMultiSelect - used to select people for a group.
 */

'use client';

import { usePersons } from '@/hooks/usePersons';
import { PersonChip } from './PersonChip';

interface PersonMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
  excludePersonIds?: number[];
}

export function PersonMultiSelect({ value, onChange, excludePersonIds = [] }: PersonMultiSelectProps) {
  const { data: personsData } = usePersons();
  const allPersons = personsData?.items || [];

  const selectedPersons = allPersons.filter((p) => value.includes(p.id));
  const availablePersons = allPersons.filter(
    (p) => !value.includes(p.id) && !excludePersonIds.includes(p.id)
  );

  const handleSelect = (personId: number) => {
    if (value.includes(personId)) {
      onChange(value.filter((id) => id !== personId));
    } else {
      onChange([...value, personId]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected people */}
      {selectedPersons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPersons.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              selected={true}
              onToggle={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Available people */}
      {availablePersons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availablePersons.map((person) => (
            <PersonChip
              key={person.id}
              person={person}
              selected={false}
              onToggle={handleSelect}
            />
          ))}
        </div>
      )}

      {availablePersons.length === 0 && selectedPersons.length === 0 && (
        <p className="text-sm text-gray-500">No people available</p>
      )}
    </div>
  );
}
