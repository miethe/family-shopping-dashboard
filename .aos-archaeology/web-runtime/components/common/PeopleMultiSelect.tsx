/**
 * PeopleMultiSelect Component
 *
 * Multi-select interface for choosing people with inline add capability.
 * Used in gift forms to link gifts to recipients.
 */

'use client';

import { useState } from 'react';
import { usePersons, useCreatePerson } from '@/hooks/usePersons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { PlusIcon, XIcon } from '@/components/layout/icons';

interface PeopleMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export function PeopleMultiSelect({ value, onChange }: PeopleMultiSelectProps) {
  const { data: personsResponse } = usePersons();
  const people = personsResponse?.items || [];
  const [isAdding, setIsAdding] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const createPerson = useCreatePerson();

  const selectedPeople = people.filter((p) => value.includes(p.id));
  const availablePeople = people.filter((p) => !value.includes(p.id));

  const handleSelect = (personId: number) => {
    if (value.includes(personId)) {
      onChange(value.filter((id) => id !== personId));
    } else {
      onChange([...value, personId]);
    }
  };

  const handleAddNew = async () => {
    if (!newPersonName.trim()) return;

    try {
      const person = await createPerson.mutateAsync({
        display_name: newPersonName.trim(),
      });
      onChange([...value, person.id]);
      setNewPersonName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create person:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected people */}
      {selectedPeople.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <div
              key={person.id}
              className="inline-flex items-center gap-2 pl-1 pr-3 py-1 bg-warm-100 text-warm-900 border border-warm-300 rounded-full"
            >
              <Avatar size="xs">
                <AvatarFallback>{getInitials(person.display_name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{person.display_name}</span>
              <button
                type="button"
                onClick={() => handleSelect(person.id)}
                className="min-h-[24px] min-w-[24px] flex items-center justify-center text-warm-600 hover:text-warm-800 rounded-full hover:bg-warm-200 transition-colors"
                aria-label={`Remove ${person.display_name}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available people */}
      {availablePeople.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availablePeople.slice(0, 6).map((person) => (
            <Button
              key={person.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelect(person.id)}
              className="h-8"
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              {person.display_name}
            </Button>
          ))}
        </div>
      )}

      {/* Add new inline */}
      {isAdding ? (
        <div className="flex gap-2">
          <Input
            placeholder="Person name"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNew();
              }
            }}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleAddNew}
            disabled={!newPersonName.trim() || createPerson.isPending}
            isLoading={createPerson.isPending}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewPersonName('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-8"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add New Person
        </Button>
      )}
    </div>
  );
}
