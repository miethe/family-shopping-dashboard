/**
 * PersonMultiSelect Component
 *
 * Multi-select interface for choosing people.
 * Inverse of GroupMultiSelect - used to select people for a group.
 */

'use client';

import { usePersons } from '@/hooks/usePersons';
import { Button } from '@/components/ui/button';
import { XIcon } from '@/components/layout/icons';

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
            <div
              key={person.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border-2 border-orange-200 rounded-full"
            >
              <span className="text-xs font-medium text-warm-900">{person.display_name}</span>
              <button
                type="button"
                onClick={() => handleSelect(person.id)}
                className="min-h-[24px] min-w-[24px] flex items-center justify-center text-orange-600 hover:text-orange-800 rounded-full hover:bg-orange-100 transition-colors"
                aria-label={`Remove ${person.display_name}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available people */}
      {availablePersons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availablePersons.map((person) => (
            <Button
              key={person.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelect(person.id)}
              className="h-8"
            >
              {person.display_name}
            </Button>
          ))}
        </div>
      )}

      {availablePersons.length === 0 && selectedPersons.length === 0 && (
        <p className="text-sm text-gray-500">No people available</p>
      )}
    </div>
  );
}
