/**
 * AddListItemModal Component
 *
 * Modal dialog for adding an item to a list with two modes:
 * 1. Add Existing - Select from existing gifts with search
 * 2. Create New - Create a new gift inline and add to list
 *
 * Both modes include status selection and optional notes.
 * Follows mobile-first patterns with 44px touch targets and real-time integration.
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { useCreateListItem } from '@/hooks/useListItems';
import { useGifts, useCreateGift } from '@/hooks/useGifts';
import { useLists } from '@/hooks/useLists';
import type { ListItem, ListItemStatus, Gift, GiftCreate, GiftList } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export interface AddListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  defaultStatus?: ListItemStatus;
  onSuccess?: (item: ListItem) => void;
}

type TabMode = 'existing' | 'new';

export function AddListItemModal({
  isOpen,
  onClose,
  listId,
  defaultStatus = 'idea',
  onSuccess,
}: AddListItemModalProps) {
  const queryClient = useQueryClient();
  const createItemMutation = useCreateListItem();
  const createGiftMutation = useCreateGift();
  const { data: giftsResponse, isLoading: isLoadingGifts } = useGifts(undefined, {
    enabled: isOpen,
  });
  const { data: listsResponse } = useLists(undefined, { enabled: isOpen });
  const { toast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabMode>('existing');

  // Add Existing state
  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [additionalListIds, setAdditionalListIds] = useState<number[]>([]);

  // Create New state
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftUrl, setNewGiftUrl] = useState('');
  const [newGiftPrice, setNewGiftPrice] = useState('');
  const [newGiftImageUrl, setNewGiftImageUrl] = useState('');

  // Common state
  const [status, setStatus] = useState<ListItemStatus>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync status when modal opens with new defaultStatus
  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus);
    }
  }, [isOpen, defaultStatus]);

  // Filter gifts based on search query
  const filteredGifts = useMemo(() => {
    if (!giftsResponse?.items) return [];

    if (!searchQuery.trim()) return giftsResponse.items;

    const query = searchQuery.toLowerCase();
    return giftsResponse.items.filter((gift: Gift) =>
      gift.name.toLowerCase().includes(query)
    );
  }, [giftsResponse?.items, searchQuery]);

  const otherLists = useMemo<GiftList[]>(() => {
    const lists = listsResponse?.items || [];
    return lists.filter((list) => list.id !== listId);
  }, [listsResponse?.items, listId]);

  const renderAdditionalListPicker = () => {
    if (otherLists.length === 0) return null;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Also add to other lists
        </label>
        <div className="border border-gray-300 rounded-md max-h-[160px] overflow-y-auto divide-y divide-gray-200">
          {otherLists.map((list) => {
            const isSelected = additionalListIds.includes(list.id);
            return (
              <label
                key={list.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={isSelected}
                  onChange={() => {
                    setAdditionalListIds((prev) =>
                      prev.includes(list.id)
                        ? prev.filter((id) => id !== list.id)
                        : [...prev, list.id]
                    );
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{list.name}</div>
                  <div className="text-xs text-gray-500 capitalize">
                    {list.type} • {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleGiftSelect = (giftId: number) => {
    setSelectedGiftId(giftId);
    setError(null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as ListItemStatus);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const resetForm = () => {
    setActiveTab('existing');
    setSelectedGiftId(null);
    setSearchQuery('');
    setNewGiftName('');
    setNewGiftUrl('');
    setNewGiftPrice('');
    setNewGiftImageUrl('');
    setStatus(defaultStatus);
    setNotes('');
    setError(null);
    setAdditionalListIds([]);
  };

  const linkToAdditionalLists = async (giftId: number) => {
    if (additionalListIds.length === 0) return { failures: 0, total: 0 };

    const targets = additionalListIds.filter((id) => id !== listId);
    if (targets.length === 0) return { failures: 0, total: 0 };

    const results = await Promise.allSettled(
      targets.map((targetListId) =>
        createItemMutation.mutateAsync({
          listId: targetListId,
          data: {
            gift_id: giftId,
            status,
            notes: notes.trim() || undefined,
          },
        })
      )
    );

    const blockingFailures = results.filter((res) => {
      if (res.status !== 'rejected') return false;
      const message = res.reason instanceof Error ? res.reason.message : String(res.reason || '');
      return !message.toLowerCase().includes('already in the list');
    });

    return {
      failures: blockingFailures.length,
      total: targets.length,
    };
  };

  const handleSubmitExisting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedGiftId) {
      setError('Please select a gift');
      return;
    }

    try {
      const newItem = await createItemMutation.mutateAsync({
        listId,
        data: {
          gift_id: selectedGiftId,
          status,
          notes: notes.trim() || undefined,
        },
      });

      const linkResult = await linkToAdditionalLists(selectedGiftId);

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });

      if (linkResult.failures > 0) {
        toast({
          title: 'Linked with warnings',
          description: `Added to this list, but ${linkResult.failures} of ${linkResult.total} additional lists failed.`,
          variant: 'warning',
        });
      }

      // Call success callback if provided
      onSuccess?.(newItem);

      // Close modal and reset form
      onClose();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!newGiftName.trim()) {
      setError('Gift name is required');
      return;
    }

    try {
      // Step 1: Create the gift
      const giftData: GiftCreate = {
        name: newGiftName.trim(),
        url: newGiftUrl.trim() || undefined,
        price: newGiftPrice ? parseFloat(newGiftPrice) : undefined,
        image_url: newGiftImageUrl.trim() || undefined,
      };

      const newGift = await createGiftMutation.mutateAsync(giftData);

      // Step 2: Add the new gift to the list
      const newItem = await createItemMutation.mutateAsync({
        listId,
        data: {
          gift_id: newGift.id,
          status,
          notes: notes.trim() || undefined,
        },
      });

      const linkResult = await linkToAdditionalLists(newGift.id);

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      queryClient.invalidateQueries({ queryKey: ['gifts'] });

      if (linkResult.failures > 0) {
        toast({
          title: 'Linked with warnings',
          description: `Added to this list, but ${linkResult.failures} of ${linkResult.total} additional lists failed.`,
          variant: 'warning',
        });
      }

      // Call success callback if provided
      onSuccess?.(newItem);

      // Close modal and reset form
      onClose();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create and add gift';
      setError(message);
    }
  };

  const handleClose = () => {
    if (!createItemMutation.isPending && !createGiftMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const isSubmitting = createItemMutation.isPending || createGiftMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to List</DialogTitle>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('existing')}
            className={`flex-1 px-4 py-2 text-sm font-medium min-h-[44px] transition-colors ${
              activeTab === 'existing'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Add Existing
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('new')}
            className={`flex-1 px-4 py-2 text-sm font-medium min-h-[44px] transition-colors ${
              activeTab === 'new'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Add Existing Tab */}
        {activeTab === 'existing' && (
          <form onSubmit={handleSubmitExisting} className="space-y-4">
            {/* Gift Selection */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Select Gift
              </label>
              <input
                id="search"
                type="text"
                placeholder="Search gifts..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] mb-2"
                autoFocus
              />

              <div className="border border-gray-300 rounded-md max-h-[240px] overflow-y-auto">
                {isLoadingGifts ? (
                  <div className="p-4 text-center text-gray-500">Loading gifts...</div>
                ) : filteredGifts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No gifts found' : 'No gifts available'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredGifts.map((gift: Gift) => (
                      <button
                        key={gift.id}
                        type="button"
                        onClick={() => handleGiftSelect(gift.id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 transition-colors min-h-[44px] flex items-center gap-3 ${
                          selectedGiftId === gift.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        {gift.image_url && (
                          <Image
                            src={gift.image_url}
                            alt={gift.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                            unoptimized
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{gift.name}</div>
                          {gift.price && (
                            <div className="text-sm text-gray-500">${formatPrice(gift.price)}</div>
                          )}
                        </div>
                        {selectedGiftId === gift.id && (
                          <svg
                            className="w-5 h-5 text-blue-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                <option value="idea">Idea</option>
                <option value="selected">Selected</option>
                <option value="purchased">Purchased</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about this item..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {renderAdditionalListPicker()}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || !selectedGiftId}
                className="flex-1 sm:flex-initial"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Create New Tab */}
        {activeTab === 'new' && (
          <form onSubmit={handleSubmitNew} className="space-y-4">
            {/* Gift Name */}
            <Input
              label="Name"
              value={newGiftName}
              onChange={(e) => setNewGiftName(e.target.value)}
              required
              placeholder="Enter gift name"
              autoFocus
            />

            {/* Gift URL */}
            <Input
              label="URL (optional)"
              type="url"
              value={newGiftUrl}
              onChange={(e) => setNewGiftUrl(e.target.value)}
              placeholder="https://..."
              helperText="Link to the product page"
            />

            {/* Gift Price */}
            <Input
              label="Price (optional)"
              type="number"
              step="0.01"
              min="0"
              value={newGiftPrice}
              onChange={(e) => setNewGiftPrice(e.target.value)}
              placeholder="29.99"
              helperText="Price in USD"
            />

            {/* Gift Image URL */}
            <Input
              label="Image URL (optional)"
              type="url"
              value={newGiftImageUrl}
              onChange={(e) => setNewGiftImageUrl(e.target.value)}
              placeholder="https://..."
              helperText="Direct link to product image"
            />

            {/* Status Selection */}
            <div>
              <label htmlFor="status-new" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-new"
                value={status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px]"
              >
                <option value="idea">Idea</option>
                <option value="selected">Selected</option>
                <option value="purchased">Purchased</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label htmlFor="notes-new" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="notes-new"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add any notes about this item..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {renderAdditionalListPicker()}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || !newGiftName.trim()}
                className="flex-1 sm:flex-initial"
              >
                {isSubmitting ? 'Creating...' : 'Create & Add'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
