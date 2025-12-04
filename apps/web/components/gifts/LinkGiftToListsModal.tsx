/**
 * LinkGiftToListsModal
 *
 * Allows attaching a gift to one or more existing lists or creating a new list
 * and linking immediately. Mirrors the existing/new pattern used elsewhere.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { useLists, useListsForGift } from '@/hooks/useLists';
import { useCreateListItem } from '@/hooks/useListItems';
import { AddListModal } from '@/components/lists/AddListModal';
import type { GiftList, ListItemStatus } from '@/types';
import { cn } from '@/lib/utils';

interface LinkGiftToListsModalProps {
  giftId: number;
  isOpen: boolean;
  onClose: () => void;
  onLinked?: () => void;
}

type TabMode = 'existing' | 'new';

export function LinkGiftToListsModal({
  giftId,
  isOpen,
  onClose,
  onLinked,
}: LinkGiftToListsModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabMode>('existing');
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<ListItemStatus>('idea');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listsResponse, isLoading: isLoadingLists } = useLists(undefined, { enabled: isOpen });
  const { data: listsWithGift } = useListsForGift(giftId, { enabled: isOpen });
  const createListItem = useCreateListItem();

  const existingListIds = useMemo(
    () => (listsWithGift?.data || []).map((list) => list.id),
    [listsWithGift?.data]
  );

  const availableLists = useMemo(() => {
    const lists = listsResponse?.items || [];
    if (!searchQuery.trim()) {
      return lists;
    }
    const query = searchQuery.toLowerCase();
    return lists.filter((list) => list.name.toLowerCase().includes(query));
  }, [listsResponse?.items, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('existing');
      setSelectedListIds([]);
      setSearchQuery('');
      setStatus('idea');
      setError(null);
    }
  }, [isOpen]);

  const resetState = () => {
    setSelectedListIds([]);
    setSearchQuery('');
    setStatus('idea');
    setError(null);
  };

  const handleLinkExisting = async () => {
    setError(null);
    const targets = selectedListIds.filter((id) => !existingListIds.includes(id));

    if (targets.length === 0) {
      setError('Select at least one list that does not already include this gift.');
      return;
    }

    setIsSubmitting(true);
    const results = await Promise.allSettled(
      targets.map((listId) =>
        createListItem.mutateAsync({
          listId,
          data: { gift_id: giftId, status },
        })
      )
    );

    const failures = results.filter((result) => result.status === 'rejected');

    if (failures.length === targets.length) {
      setError('Unable to link this gift to the selected lists.');
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Gift linked',
      description: `Added to ${targets.length - failures.length} list${targets.length - failures.length === 1 ? '' : 's'}.`,
    });

    queryClient.invalidateQueries({ queryKey: ['lists'] });
    queryClient.invalidateQueries({ queryKey: ['lists', 'gift', giftId] });
    onLinked?.();
    setIsSubmitting(false);
    onClose();
    resetState();
  };

  const handleNewListCreated = async (list: GiftList) => {
    try {
      await createListItem.mutateAsync({
        listId: list.id,
        data: { gift_id: giftId, status },
      });

      toast({
        title: 'Gift linked',
        description: `Added to new list "${list.name}".`,
      });

      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['lists', 'gift', giftId] });
      onLinked?.();
      setShowCreateListModal(false);
      onClose();
      resetState();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link gift to the new list.';
      setError(message);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Link Gift to Lists</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabMode)}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="existing" className="flex-1">
                Add to Existing
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1">
                Create New
              </TabsTrigger>
            </TabsList>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 mb-3">
                {error}
              </div>
            )}

            <TabsContent value="existing" className="space-y-4">
              <Input
                label="Search lists"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="border border-slate-200 rounded-lg max-h-[260px] overflow-y-auto">
                {isLoadingLists ? (
                  <div className="p-4 text-center text-slate-500">Loading lists...</div>
                ) : availableLists.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No lists found.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {availableLists.map((list) => {
                      const isAlreadyLinked = existingListIds.includes(list.id);
                      const isSelected = selectedListIds.includes(list.id);

                      return (
                        <label
                          key={list.id}
                          className={cn(
                            'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                            isSelected && !isAlreadyLinked ? 'bg-blue-50' : 'hover:bg-slate-50',
                            isAlreadyLinked && 'opacity-60 cursor-not-allowed'
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            disabled={isAlreadyLinked}
                            checked={isSelected && !isAlreadyLinked}
                            onChange={() => {
                              if (isAlreadyLinked) return;
                              setSelectedListIds((prev) =>
                                prev.includes(list.id)
                                  ? prev.filter((id) => id !== list.id)
                                  : [...prev, list.id]
                              );
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">{list.name}</span>
                              <Badge variant="default" className="text-xs">
                                {list.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-600">
                              {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                          {isAlreadyLinked && (
                            <span className="text-xs text-slate-500">Linked</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status for new list items
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ListItemStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="idea">Idea</option>
                  <option value="selected">Selected</option>
                  <option value="purchased">Purchased</option>
                  <option value="received">Gifted</option>
                </select>
              </div>

              <Button
                onClick={handleLinkExisting}
                isLoading={isSubmitting}
                disabled={isSubmitting || selectedListIds.length === 0}
                className="w-full"
              >
                Link to Selected Lists
              </Button>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-slate-700 bg-slate-50">
                <p className="font-medium mb-1">Create a new list</p>
                <p className="text-sm text-slate-600">
                  You can create a new list and we&apos;ll add this gift to it automatically.
                </p>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateListModal(true)}
                  className="min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status for the new list item
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ListItemStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="idea">Idea</option>
                  <option value="selected">Selected</option>
                  <option value="purchased">Purchased</option>
                  <option value="received">Gifted</option>
                </select>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showCreateListModal && (
        <AddListModal
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
          mode="create"
          onSuccess={handleNewListCreated}
        />
      )}
    </>
  );
}
