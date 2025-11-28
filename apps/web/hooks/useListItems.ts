/**
 * List Items Hook
 *
 * React Query hooks for ListItem entity CRUD operations with cache management.
 * Provides list items fetching, status updates, assignment, and creation.
 *
 * Note: List items are nested resources under lists in the API.
 * - GET /lists/{list_id}/items - get items
 * - POST /lists/{list_id}/items - create item
 * - PUT /list-items/{id}/status - update status
 * - PUT /list-items/{id}/assign - assign user
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listItemApi, ListItemListParams } from '@/lib/api/endpoints';
import type { ListItemCreate } from '@/types';
import { useRealtimeSync } from './useRealtimeSync';

/**
 * Fetch list items for a specific list
 * @param listId - Required list ID to fetch items for
 */
export function useListItems(listId: number | undefined) {
  const query = useQuery({
    queryKey: ['list-items', listId],
    queryFn: () => listItemApi.list({ list_id: listId! }),
    enabled: !!listId, // Only fetch if list_id is provided
  });

  // Real-time sync for list item changes
  useRealtimeSync({
    topic: listId ? `list:${listId}` : '',
    queryKey: ['list-items', listId],
    events: ['ADDED', 'UPDATED', 'DELETED', 'STATUS_CHANGED'],
    enabled: !!listId, // Only sync if list_id is provided
  });

  return query;
}

/**
 * Create new list item in a specific list
 * Invalidates list-items cache on success
 */
export function useCreateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listId, data }: { listId: number; data: Omit<ListItemCreate, 'list_id'> }) =>
      listItemApi.create(listId, data),
    onSuccess: (_, { listId }) => {
      // Invalidate list-items for this list
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      // Also invalidate the parent list to update item counts
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Update list item status
 * @param listId - Parent list ID (for cache invalidation)
 * Invalidates list-items cache on success
 */
export function useUpdateListItemStatus(listId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: number; status: string }) =>
      listItemApi.updateStatus(itemId, status),
    onSuccess: () => {
      // Invalidate list-items for this list
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      // Also invalidate the parent list
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Assign list item to a user
 * @param listId - Parent list ID (for cache invalidation)
 * Invalidates list-items cache on success
 */
export function useAssignListItem(listId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, assignedToId }: { itemId: number; assignedToId: number | null }) =>
      listItemApi.assign(itemId, assignedToId),
    onSuccess: () => {
      // Invalidate list-items for this list
      queryClient.invalidateQueries({ queryKey: ['list-items', listId] });
      // Also invalidate the parent list
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
