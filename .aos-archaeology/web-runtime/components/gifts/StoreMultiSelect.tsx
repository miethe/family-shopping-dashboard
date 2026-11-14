/**
 * StoreMultiSelect Component
 *
 * Multi-select component for stores with inline add capability.
 * Displays selected stores as badges with remove option,
 * shows quick-add buttons for available stores,
 * and provides inline form to create new stores.
 */

'use client';

import { useState } from 'react';
import { useStores, useCreateStore } from '@/hooks/useStores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PlusIcon, XIcon } from '@/components/layout/icons';
import type { StoreMinimal } from '@/types';
import { cn } from '@/lib/utils';

export interface StoreMultiSelectProps {
  value: number[]; // Selected store IDs
  onChange: (ids: number[]) => void;
  stores?: StoreMinimal[]; // Pre-loaded stores for display (from gift data)
  className?: string;
  label?: string;
  helperText?: string;
}

export function StoreMultiSelect({
  value,
  onChange,
  stores: initialStores = [],
  className,
  label,
  helperText,
}: StoreMultiSelectProps) {
  const { data: storesResponse, isLoading } = useStores();
  const createStore = useCreateStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreUrl, setNewStoreUrl] = useState('');
  const [error, setError] = useState('');

  // Extract stores from paginated response
  const allStores = storesResponse?.items ?? [];

  // Merge initial stores with all stores to handle new stores
  const storesMap = new Map<number, StoreMinimal>();
  initialStores.forEach((store) => storesMap.set(store.id, store));
  allStores.forEach((store) =>
    storesMap.set(store.id, { id: store.id, name: store.name, url: store.url })
  );

  const selectedStores = value
    .map((id) => storesMap.get(id))
    .filter((store): store is StoreMinimal => store !== undefined);

  const availableStores = allStores.filter((s) => !value.includes(s.id));

  const handleSelect = (storeId: number) => {
    if (value.includes(storeId)) {
      onChange(value.filter((id) => id !== storeId));
    } else {
      onChange([...value, storeId]);
    }
  };

  const handleAddNew = async () => {
    if (!newStoreName.trim()) {
      setError('Store name is required');
      return;
    }

    try {
      setError('');
      const store = await createStore.mutateAsync({
        name: newStoreName.trim(),
        url: newStoreUrl.trim() || null,
      });

      // Add new store to selection
      onChange([...value, store.id]);

      // Reset form
      setNewStoreName('');
      setNewStoreUrl('');
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewStoreName('');
    setNewStoreUrl('');
    setError('');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold text-warm-800 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Selected stores as badges */}
      {selectedStores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStores.map((store) => (
            <Badge
              key={store.id}
              variant="default"
              className="gap-1.5 cursor-pointer hover:bg-warm-200 transition-colors"
            >
              <span>{store.name}</span>
              <button
                type="button"
                onClick={() => handleSelect(store.id)}
                className="hover:text-warm-900 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded-small"
                aria-label={`Remove ${store.name}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Available stores - quick add buttons */}
      {!isAdding && availableStores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableStores.slice(0, 5).map((store) => (
            <Button
              key={store.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelect(store.id)}
              disabled={isLoading}
            >
              <PlusIcon className="h-3 w-3 mr-1" />
              {store.name}
            </Button>
          ))}
          {availableStores.length > 5 && (
            <span className="text-xs text-warm-600 self-center">
              +{availableStores.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Add new store inline form */}
      {isAdding ? (
        <div className="space-y-2 p-3 border-2 border-primary-200 rounded-medium bg-primary-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Store name"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              error={error}
              autoFocus
            />
            <Input
              placeholder="URL (optional)"
              value={newStoreUrl}
              onChange={(e) => setNewStoreUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={createStore.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAddNew}
              disabled={!newStoreName.trim() || createStore.isPending}
              isLoading={createStore.isPending}
            >
              Add Store
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          disabled={isLoading}
          className="self-start"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add New Store
        </Button>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-xs text-warm-600">{helperText}</p>
      )}
    </div>
  );
}
