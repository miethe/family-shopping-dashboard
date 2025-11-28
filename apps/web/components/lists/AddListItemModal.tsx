/**
 * AddListItemModal Component
 *
 * Modal dialog for adding an item to a list with gift selection, status, and optional notes.
 * Follows mobile-first patterns with 44px touch targets and real-time integration.
 */

'use client';

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateListItem } from '@/hooks/useListItems';
import { useGifts } from '@/hooks/useGifts';
import type { ListItem, ListItemStatus, Gift } from '@/types';

export interface AddListItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: number;
  defaultStatus?: ListItemStatus;
  onSuccess?: (item: ListItem) => void;
}

export function AddListItemModal({
  isOpen,
  onClose,
  listId,
  defaultStatus = 'idea',
  onSuccess,
}: AddListItemModalProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateListItem();
  const { data: giftsResponse, isLoading: isLoadingGifts } = useGifts();

  const [selectedGiftId, setSelectedGiftId] = useState<number | null>(null);
  const [status, setStatus] = useState<ListItemStatus>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter gifts based on search query
  const filteredGifts = useMemo(() => {
    if (!giftsResponse?.items) return [];

    if (!searchQuery.trim()) return giftsResponse.items;

    const query = searchQuery.toLowerCase();
    return giftsResponse.items.filter((gift: Gift) =>
      gift.name.toLowerCase().includes(query)
    );
  }, [giftsResponse?.items, searchQuery]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedGiftId) {
      setError('Please select a gift');
      return;
    }

    try {
      const newItem = await createMutation.mutateAsync({
        listId,
        data: {
          gift_id: selectedGiftId,
          status,
          notes: notes.trim() || undefined,
        },
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });

      // Call success callback if provided
      onSuccess?.(newItem);

      // Close modal and reset form
      onClose();
      setSelectedGiftId(null);
      setStatus(defaultStatus);
      setNotes('');
      setSearchQuery('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      setError(null);
      setSelectedGiftId(null);
      setStatus(defaultStatus);
      setNotes('');
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Item to List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

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
                        <img
                          src={gift.image_url}
                          alt={gift.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{gift.name}</div>
                        {gift.price && (
                          <div className="text-sm text-gray-500">${gift.price.toFixed(2)}</div>
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending || !selectedGiftId}
              className="flex-1 sm:flex-initial"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
