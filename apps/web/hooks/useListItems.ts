/**
 * List Items Hook
 *
 * React Query hooks for ListItem entity CRUD operations with cache management.
 * Provides list items fetching, update, create, and delete functionality.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listItemApi, ListItemListParams } from '@/lib/api/endpoints';
import type { ListItemCreate, ListItemUpdate } from '@/types';

/**
 * Fetch list items with optional filters
 * @param params - Optional list_id, assigned_to, status filters
 */
export function useListItems(params?: ListItemListParams) {
  return useQuery({
    queryKey: ['list-items', params],
    queryFn: () => listItemApi.list(params),
    enabled: !!params?.list_id, // Only fetch if list_id is provided
  });
}

/**
 * Fetch single list item by ID
 * @param id - List item ID
 */
export function useListItem(id: number) {
  return useQuery({
    queryKey: ['list-items', id],
    queryFn: () => listItemApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create new list item
 * Invalidates list-items cache on success
 */
export function useCreateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ListItemCreate) => listItemApi.create(data),
    onSuccess: () => {
      // Invalidate all list-items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['list-items'] });
      // Also invalidate the parent list to update item counts
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Update existing list item
 * Invalidates list-items cache on success
 */
export function useUpdateListItem(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ListItemUpdate) => listItemApi.update(id, data),
    onSuccess: () => {
      // Invalidate list-items queries to refetch
      queryClient.invalidateQueries({ queryKey: ['list-items'] });
      // Also invalidate the parent list
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Delete list item
 * Invalidates list-items cache on success
 */
export function useDeleteListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listItemApi.delete(id),
    onSuccess: () => {
      // Invalidate all list-items queries
      queryClient.invalidateQueries({ queryKey: ['list-items'] });
      // Also invalidate the parent list
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
