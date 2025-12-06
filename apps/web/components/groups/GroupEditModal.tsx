/**
 * Group Edit Modal Component
 *
 * Modal dialog for editing groups. Allows editing group details (name, color, description)
 * and managing group members (adding/removing people).
 */

'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EntityModal } from '@/components/modals/EntityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateGroup } from '@/hooks/useGroups';
import { usePersons } from '@/hooks/usePersons';
import { PersonMultiSelect } from '@/components/common/PersonMultiSelect';
import { personApi } from '@/lib/api/endpoints';
import type { Group, GroupUpdate } from '@/types';

interface GroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  onSuccess?: (group: Group) => void;
}

export function GroupEditModal({
  isOpen,
  onClose,
  group,
  onSuccess,
}: GroupEditModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const [memberPersonIds, setMemberPersonIds] = useState<number[]>([]);
  const [initialMemberIds, setInitialMemberIds] = useState<number[]>([]);

  const updateGroupMutation = useUpdateGroup(group.id);
  const { data: personsData } = usePersons();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);
  const isPending = updateGroupMutation.isPending || isUpdatingMembers;

  // Pre-populate form when modal opens
  useEffect(() => {
    if (isOpen && group) {
      setName(group.name);
      setColor(group.color || '#3B82F6');
      setDescription(group.description || '');

      // Find all people in this group
      const allPersons = personsData?.items || [];
      const membersInGroup = allPersons
        .filter((p) => p.groups?.some((g) => g.id === group.id))
        .map((p) => p.id);

      setMemberPersonIds(membersInGroup);
      setInitialMemberIds(membersInGroup);
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, group, personsData]);

  const resetForm = () => {
    setName('');
    setColor('#3B82F6');
    setDescription('');
    setMemberPersonIds([]);
    setInitialMemberIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      // 1. Update group details
      const groupUpdate: GroupUpdate = {
        name: name.trim(),
        color: color || null,
        description: description.trim() || null,
      };

      const updatedGroup = await updateGroupMutation.mutateAsync(groupUpdate);

      // 2. Update person-group relationships
      setIsUpdatingMembers(true);
      const allPersons = personsData?.items || [];

      // Find people to add (in memberPersonIds but not in initialMemberIds)
      const personsToAdd = memberPersonIds.filter((id) => !initialMemberIds.includes(id));

      // Find people to remove (in initialMemberIds but not in memberPersonIds)
      const personsToRemove = initialMemberIds.filter((id) => !memberPersonIds.includes(id));

      // Add people to group (update their group_ids to include this group)
      for (const personId of personsToAdd) {
        const person = allPersons.find((p) => p.id === personId);
        if (person) {
          const currentGroupIds = person.groups?.map((g) => g.id) || [];
          const newGroupIds = [...currentGroupIds, group.id];

          await personApi.update(personId, {
            group_ids: newGroupIds,
          });
        }
      }

      // Remove people from group (update their group_ids to exclude this group)
      for (const personId of personsToRemove) {
        const person = allPersons.find((p) => p.id === personId);
        if (person) {
          const currentGroupIds = person.groups?.map((g) => g.id) || [];
          const newGroupIds = currentGroupIds.filter((gid) => gid !== group.id);

          await personApi.update(personId, {
            group_ids: newGroupIds,
          });
        }
      }

      // Invalidate persons cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['persons'] });

      setIsUpdatingMembers(false);

      toast({
        title: 'Group updated!',
        description: `${updatedGroup.name} has been updated.`,
        variant: 'success',
      });

      onSuccess?.(updatedGroup);
      onClose();
    } catch (err: any) {
      setIsUpdatingMembers(false);
      toast({
        title: 'Failed to update group',
        description: err.message || 'An error occurred while updating the group.',
        variant: 'error',
      });
    }
  };

  const handleClose = () => {
    if (!isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <EntityModal
      open={isOpen}
      onOpenChange={handleClose}
      entityType="person"
      title="Edit Group"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Group Details</h3>

          <Input
            label="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Family, Friends, Coworkers"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 border-2 border-warm-300 rounded-medium cursor-pointer"
                aria-label="Group color"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose a color to identify this group
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this group..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional description for this group
            </p>
          </div>
        </section>

        {/* Members Section */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manage members
            </label>
            <PersonMultiSelect
              value={memberPersonIds}
              onChange={setMemberPersonIds}
            />
            <p className="mt-1 text-xs text-gray-500">
              Add or remove people from this group
            </p>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="min-h-[44px] min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={isPending || !name.trim()}
            className="min-h-[44px] min-w-[120px]"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </EntityModal>
  );
}
