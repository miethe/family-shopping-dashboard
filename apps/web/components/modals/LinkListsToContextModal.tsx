/**
 * LinkListsToContextModal
 *
 * Provides existing/new flows for attaching lists to a person or occasion.
 * Mirrors the tabbed UX used elsewhere to keep Linked Entities consistent.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLists } from '@/hooks/useLists';
import { listApi } from '@/lib/api/endpoints';
import { AddListModal } from '@/components/lists/AddListModal';
import type { GiftList } from '@/types';
import { useToast } from '@/components/ui/use-toast';

type ContextType = 'person' | 'occasion';
type TabMode = 'existing' | 'new';

interface LinkListsToContextModalProps {
  contextId: number;
  contextType: ContextType;
  isOpen: boolean;
  onClose: () => void;
  existingListIds?: number[];
}

export function LinkListsToContextModal({
  contextId,
  contextType,
  isOpen,
  onClose,
  existingListIds = [],
}: LinkListsToContextModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabMode>('existing');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: listsResponse, isLoading: isLoadingLists } = useLists(undefined, { enabled: isOpen });

  const availableLists = useMemo(() => {
    const lists = listsResponse?.items || [];
    const filtered = searchQuery.trim()
      ? lists.filter((list) => list.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : lists;

    return filtered;
  }, [listsResponse?.items, searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('existing');
      setSelectedIds([]);
      setSearchQuery('');
      setError(null);
    }
  }, [isOpen]);

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ['lists'] });
    queryClient.invalidateQueries({ queryKey: ['lists', contextType, contextId] });
  };

  const handleLinkExisting = async () => {
    setError(null);
    const targets = selectedIds.filter((id) => !existingListIds.includes(id));

    if (targets.length === 0) {
      setError('Select at least one list that is not already linked.');
      return;
    }

    setIsSubmitting(true);
    const payload =
      contextType === 'person'
        ? { person_id: contextId }
        : { occasion_id: contextId };

    const results = await Promise.allSettled(targets.map((id) => listApi.update(id, payload)));
    const failures = results.filter((res) => res.status === 'rejected');

    if (failures.length === targets.length) {
      setError('Unable to update the selected lists.');
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Lists linked',
      description: `Updated ${targets.length - failures.length} list${targets.length - failures.length === 1 ? '' : 's'}.`,
    });

    invalidateLists();
    setIsSubmitting(false);
    onClose();
  };

  const handleNewListCreated = (list: GiftList) => {
    invalidateLists();
    toast({
      title: 'List created',
      description: `Created "${list.name}" and linked it automatically.`,
    });
    setShowCreateListModal(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Link Lists to {contextType === 'person' ? 'Person' : 'Occasion'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabMode)}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="existing" className="flex-1">
                Add Existing
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
                      const isSelected = selectedIds.includes(list.id);

                      return (
                        <label
                          key={list.id}
                          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 ${
                            isSelected && !isAlreadyLinked ? 'bg-blue-50' : ''
                          } ${isAlreadyLinked ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            disabled={isAlreadyLinked}
                            checked={isSelected && !isAlreadyLinked}
                            onChange={() => {
                              if (isAlreadyLinked) return;
                              setSelectedIds((prev) =>
                                prev.includes(list.id)
                                  ? prev.filter((id) => id !== list.id)
                                  : [...prev, list.id]
                              );
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 truncate">{list.name}</span>
                              <Badge variant="default" className="text-xs capitalize">
                                {list.type}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-600">
                              {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                            </div>
                          </div>
                          {isAlreadyLinked && <span className="text-xs text-slate-500">Linked</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button
                onClick={handleLinkExisting}
                isLoading={isSubmitting}
                disabled={isSubmitting || selectedIds.length === 0}
                className="w-full"
              >
                Link Selected Lists
              </Button>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-slate-700 bg-slate-50">
                <p className="font-medium mb-1">Create a new list</p>
                <p className="text-sm text-slate-600">
                  We&apos;ll connect it to this {contextType} automatically.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateListModal(true)}
                className="w-full"
              >
                Create List
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showCreateListModal && (
        <AddListModal
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
          mode="create"
          personId={contextType === 'person' ? contextId : undefined}
          occasionId={contextType === 'occasion' ? contextId : undefined}
          onSuccess={handleNewListCreated}
        />
      )}
    </>
  );
}
