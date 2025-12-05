/**
 * GroupMultiSelect Component
 *
 * Multi-select interface for choosing groups with inline add capability.
 * Used in person forms to assign people to groups.
 */

'use client';

import { useState } from 'react';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, XIcon } from '@/components/layout/icons';

interface GroupMultiSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

export function GroupMultiSelect({ value, onChange }: GroupMultiSelectProps) {
  const { data: allGroups = [] } = useGroups();
  const [isAdding, setIsAdding] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3B82F6');
  const createGroup = useCreateGroup();

  const selectedGroups = allGroups.filter((g) => value.includes(g.id));
  const availableGroups = allGroups.filter((g) => !value.includes(g.id));

  const handleSelect = (groupId: number) => {
    if (value.includes(groupId)) {
      onChange(value.filter((id) => id !== groupId));
    } else {
      onChange([...value, groupId]);
    }
  };

  const handleAddNew = async () => {
    if (!newGroupName.trim()) return;

    try {
      const group = await createGroup.mutateAsync({
        name: newGroupName.trim(),
        color: newGroupColor,
      });
      onChange([...value, group.id]);
      setNewGroupName('');
      setNewGroupColor('#3B82F6');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected groups */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGroups.map((group) => (
            <div
              key={group.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 rounded-full"
              style={{
                borderColor: group.color || '#D4D4D8',
              }}
            >
              {group.color && (
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                  aria-hidden="true"
                />
              )}
              <span className="text-xs font-medium text-warm-900">{group.name}</span>
              <button
                type="button"
                onClick={() => handleSelect(group.id)}
                className="min-h-[24px] min-w-[24px] flex items-center justify-center text-warm-600 hover:text-warm-800 rounded-full hover:bg-warm-100 transition-colors"
                aria-label={`Remove ${group.name}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Available groups */}
      {availableGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableGroups.map((group) => (
            <Button
              key={group.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelect(group.id)}
              className="h-8"
            >
              {group.color && (
                <span
                  className="h-2 w-2 rounded-full mr-1.5"
                  style={{ backgroundColor: group.color }}
                  aria-hidden="true"
                />
              )}
              {group.name}
            </Button>
          ))}
        </div>
      )}

      {/* Add new inline */}
      {isAdding ? (
        <div className="flex gap-2 items-start">
          <Input
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNew();
              }
            }}
            className="flex-1"
          />
          <input
            type="color"
            value={newGroupColor}
            onChange={(e) => setNewGroupColor(e.target.value)}
            className="w-12 h-9 p-1 border-2 border-warm-300 rounded-medium cursor-pointer"
            aria-label="Group color"
          />
          <Button
            type="button"
            onClick={handleAddNew}
            disabled={!newGroupName.trim() || createGroup.isPending}
            isLoading={createGroup.isPending}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewGroupName('');
              setNewGroupColor('#3B82F6');
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
          Add New Group
        </Button>
      )}
    </div>
  );
}
