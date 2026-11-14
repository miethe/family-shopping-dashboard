/**
 * ListPickerDropdown Component
 *
 * Multi-select dropdown for adding a gift to multiple lists.
 * Allows users to toggle checkboxes for multiple lists and apply changes at once.
 *
 * Features:
 * - Multi-select checkboxes for all available lists
 * - "Create New List" action at bottom
 * - Apply/Cancel buttons for batch operations
 * - Shows count badge when lists are selected
 * - Loading state during mutation
 * - Mobile: 44px touch targets
 * - Toast feedback on success/error
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useLists, useListsForGift } from '@/hooks/useLists';
import { listItemApi } from '@/lib/api/endpoints';
import { Plus } from '@/components/ui/icons';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { AddListModal } from '@/components/lists/AddListModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GiftList } from '@/types';

export interface ListPickerDropdownProps {
  giftId: number;
  currentListIds?: number[];
  onApply?: (listIds: number[]) => void;
  className?: string;
}

/**
 * ListPickerDropdown Component
 *
 * Dropdown selector for adding a gift to multiple lists.
 */
export function ListPickerDropdown({
  giftId,
  currentListIds = [],
  onApply,
  className,
}: ListPickerDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedListIds, setSelectedListIds] = React.useState<number[]>(currentListIds);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allListsData, isLoading: isLoadingAllLists } = useLists();
  const { data: currentListsData } = useListsForGift(giftId);

  // Memoize lists array to maintain stable reference
  const allLists = React.useMemo(
    () => allListsData?.items ?? [],
    [allListsData?.items]
  );

  const currentLists = React.useMemo(
    () => currentListsData?.data ?? [],
    [currentListsData?.data]
  );

  // Sync selectedListIds with currentListIds when they change
  React.useEffect(() => {
    if (currentLists.length > 0) {
      setSelectedListIds(currentLists.map((list) => list.id));
    } else {
      setSelectedListIds(currentListIds);
    }
  }, [currentLists, currentListIds]);

  // Mutation to add gift to list
  const addToListMutation = useMutation({
    mutationFn: (listId: number) =>
      listItemApi.create(listId, { gift_id: giftId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });

  // Mutation to remove gift from list (delete list item)
  const removeFromListMutation = useMutation({
    mutationFn: async (listId: number) => {
      // Find the list item ID for this gift in this list
      const list = currentLists.find((l) => l.id === listId);
      if (!list) return;

      // Fetch list items to find the item ID
      const items = await listItemApi.list({ list_id: listId });
      const item = items.find((i) => i.gift.id === giftId);

      if (!item) return;

      // Delete via REST endpoint (to be implemented)
      // For now, we'll use the status update as a workaround
      return listItemApi.updateStatus(item.id, 'removed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });

  // Apply mutation - process all changes
  const applyChangesMutation = useMutation({
    mutationFn: async (newListIds: number[]) => {
      const currentIds = currentLists.map((l) => l.id);
      const toAdd = newListIds.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !newListIds.includes(id));

      // Execute all adds and removes in parallel
      const adds = toAdd.map((listId) => addToListMutation.mutateAsync(listId));
      const removes = toRemove.map((listId) => removeFromListMutation.mutateAsync(listId));

      await Promise.all([...adds, ...removes]);
      return { added: toAdd.length, removed: toRemove.length };
    },
    onSuccess: (result) => {
      const messages = [];
      if (result.added > 0) messages.push(`Added to ${result.added} list${result.added > 1 ? 's' : ''}`);
      if (result.removed > 0) messages.push(`Removed from ${result.removed} list${result.removed > 1 ? 's' : ''}`);

      toast({
        title: 'Success',
        description: messages.join(', '),
      });

      setIsOpen(false);
      onApply?.(selectedListIds);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update lists',
        variant: 'error',
      });
    },
  });

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset to current state when opening
      setSelectedListIds(currentLists.map((l) => l.id));
    }
  };

  const handleToggleList = (listId: number) => {
    setSelectedListIds((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId]
    );
  };

  const handleApply = () => {
    applyChangesMutation.mutate(selectedListIds);
  };

  const handleCancel = () => {
    setSelectedListIds(currentLists.map((l) => l.id));
    setIsOpen(false);
  };

  const handleAddNewList = () => {
    setIsCreateModalOpen(true);
    setIsOpen(false);
  };

  const handleListCreated = (list: GiftList) => {
    // Add newly created list to selection
    setSelectedListIds((prev) => [...prev, list.id]);
    // Auto-apply the change
    setTimeout(() => {
      addToListMutation.mutate(list.id, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: `Added to "${list.name}"`,
          });
        },
      });
    }, 100);
  };

  const selectedCount = selectedListIds.length;
  const isLoading = applyChangesMutation.isPending || addToListMutation.isPending || removeFromListMutation.isPending;

  return (
    <>
      <div className={cn('relative', className)} ref={dropdownRef}>
        {/* Trigger Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleToggle}
                disabled={isLoading}
                className={cn(
                  'inline-flex items-center justify-center px-2.5 py-2.5',
                  'min-h-[44px] min-w-[44px]',
                  'rounded-medium border-2 border-warm-300',
                  'bg-white text-warm-900 font-medium text-sm',
                  'transition-all duration-200',
                  'hover:border-warm-400 hover:bg-warm-50',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isOpen && 'border-primary-500 bg-warm-50'
                )}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Add to lists"
              >
                <Plus className="w-4 h-4" />
                {selectedCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold min-w-[20px] ml-1">
                    {selectedCount}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to lists</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-2 w-80',
              'bg-white border border-warm-200 rounded-large shadow-diffused',
              'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
              'max-h-[400px] overflow-hidden flex flex-col',
              // Mobile: Bottom sheet on small screens
              'md:relative md:top-auto',
              'fixed bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto',
              'rounded-t-large md:rounded-large'
            )}
            role="listbox"
            aria-label="Select lists"
          >
            {/* Header */}
            <div className="p-4 border-b border-warm-200">
              <h3 className="text-sm font-semibold text-warm-900">Add to Lists</h3>
              <p className="text-xs text-warm-600 mt-1">
                Select lists to add this gift to
              </p>
            </div>

            {/* Loading State */}
            {isLoadingAllLists && (
              <div className="p-4 text-center text-sm text-warm-600">
                Loading lists...
              </div>
            )}

            {/* List Items */}
            {!isLoadingAllLists && (
              <div className="overflow-y-auto flex-1 py-2">
                {allLists.length === 0 ? (
                  <div className="p-4 text-center text-sm text-warm-600">
                    No lists found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allLists.map((list) => {
                      const isSelected = selectedListIds.includes(list.id);

                      return (
                        <button
                          key={list.id}
                          type="button"
                          onClick={() => handleToggleList(list.id)}
                          className={cn(
                            'w-full px-4 py-2.5 flex items-center gap-3',
                            'transition-colors duration-200',
                            'hover:bg-warm-50',
                            'min-h-[44px]',
                            isSelected && 'bg-primary-50'
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => {}}
                            className="pointer-events-none"
                          />
                          <div className="flex-1 text-left overflow-hidden">
                            <div className="font-medium text-sm text-warm-900 truncate">
                              {list.name}
                            </div>
                            {list.item_count !== undefined && (
                              <div className="text-xs text-warm-600">
                                {list.item_count} item{list.item_count !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Create New List Action */}
            {!isLoadingAllLists && (
              <button
                type="button"
                onClick={handleAddNewList}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3',
                  'border-t border-warm-200',
                  'hover:bg-primary-50 transition-colors duration-200',
                  'text-primary-600 font-medium text-sm',
                  'min-h-[44px]'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-primary-600" />
                </div>
                <span>Create New List</span>
              </button>
            )}

            {/* Action Buttons */}
            <div className="p-3 border-t border-warm-200 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                disabled={isLoading}
                isLoading={isLoading}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List Creation Modal */}
      <AddListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleListCreated}
      />
    </>
  );
}
