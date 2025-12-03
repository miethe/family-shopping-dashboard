/**
 * AddToListModal Component
 *
 * Modal for selecting or creating a list to add an idea to.
 * Supports selecting existing lists or creating a new list inline.
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLists } from '@/hooks/useLists';
import { useAddIdeaToList, type IdeaItem } from '@/hooks/useIdeas';
import { useToast } from '@/components/ui/use-toast';
import { AddListModal } from '@/components/lists/AddListModal';
import { Plus, Heart, Lightbulb, CheckSquare } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { GiftList } from '@/types';

export interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: IdeaItem | null;
  onSuccess?: () => void;
}

const listTypeConfig = {
  wishlist: {
    icon: Heart,
    label: 'Wishlist',
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
  ideas: {
    icon: Lightbulb,
    label: 'Ideas',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  assigned: {
    icon: CheckSquare,
    label: 'Assigned',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
};

export function AddToListModal({
  isOpen,
  onClose,
  idea,
  onSuccess,
}: AddToListModalProps) {
  if (!isOpen) {
    return null;
  }

  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const { data: listsData, isLoading: isLoadingLists } = useLists({ limit: 50 });
  const addToListMutation = useAddIdeaToList();

  const handleListSelect = (listId: number) => {
    setSelectedListId(listId);
  };

  const handleAddToList = async () => {
    if (!selectedListId || !idea) return;

    try {
      await addToListMutation.mutateAsync({
        ideaId: idea.id,
        listId: selectedListId,
      });

      toast({
        title: 'Success',
        description: 'Idea added to list successfully',
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add idea to list';
      toast({
        title: 'Error',
        description: message,
        variant: 'error',
      });
    }
  };

  const handleCreateSuccess = (newList: GiftList) => {
    setShowCreateModal(false);
    setSelectedListId(newList.id);

    toast({
      title: 'Success',
      description: 'List created successfully. You can now add the idea to it.',
    });
  };

  const handleClose = () => {
    if (!addToListMutation.isPending) {
      setSelectedListId(null);
      onClose();
    }
  };

  const lists = listsData?.items || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Idea Preview */}
            {idea && (
              <div className="p-3 bg-warm-50 rounded-xl border border-warm-200">
                <p className="text-sm text-warm-600 mb-1">Adding:</p>
                <p className="font-semibold text-warm-900">{idea.name}</p>
                {idea.price && (
                  <p className="text-sm text-warm-600 mt-1">
                    ${idea.price.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {/* Create New List Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(true)}
              className="w-full border-dashed border-2 border-warm-300 hover:border-warm-400 hover:bg-warm-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New List
            </Button>

            {/* Existing Lists */}
            <div>
              <p className="text-sm font-medium text-warm-700 mb-2">
                Or select an existing list:
              </p>

              {isLoadingLists ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
              ) : lists.length === 0 ? (
                <div className="text-center py-8 text-warm-600">
                  <p className="text-sm">No lists yet. Create one above!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {lists.map((list) => {
                    const typeConfig = listTypeConfig[list.type];
                    const TypeIcon = typeConfig?.icon;
                    const isSelected = selectedListId === list.id;

                    return (
                      <Card
                        key={list.id}
                        variant="default"
                        padding="sm"
                        onClick={() => handleListSelect(list.id)}
                        className={cn(
                          'cursor-pointer transition-all',
                          isSelected
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                            : 'hover:border-warm-400 hover:bg-warm-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {TypeIcon && (
                            <div
                              className={cn(
                                'flex-shrink-0 rounded-lg p-2',
                                typeConfig.bgColor
                              )}
                            >
                              <TypeIcon className={cn('h-4 w-4', typeConfig.iconColor)} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-warm-900 truncate">
                              {list.name}
                            </p>
                            <p className="text-xs text-warm-600">
                              {typeConfig?.label} • {list.item_count || 0} items
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0">
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addToListMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddToList}
              disabled={!selectedListId || addToListMutation.isPending}
              isLoading={addToListMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              {addToListMutation.isPending ? 'Adding...' : 'Add to List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create List Modal */}
      <AddListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        mode="create"
      />
    </>
  );
}
