/**
 * Lists Hook
 *
 * React Query hooks for List entity CRUD operations.
 * Provides list, create, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listApi, ListListParams } from '@/lib/api/endpoints';
import type { GiftList, ListCreate, ListUpdate } from '@/types';

/**
 * Fetch paginated list of gift lists with optional filters
 * @param params - Optional cursor, limit, type, person_id, occasion_id
 */
export function useLists(params?: ListListParams) {
  return useQuery({
    queryKey: ['lists', params],
    queryFn: () => listApi.list(params),
  });
}

/**
 * Fetch single list by ID with items
 * @param id - List ID
 */
export function useList(id: number) {
  return useQuery({
    queryKey: ['lists', id],
    queryFn: () => listApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create new list
 * Invalidates lists cache on success
 */
export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ListCreate) => listApi.create(data),
    onSuccess: () => {
      // Invalidate all list queries to refetch
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}

/**
 * Update existing list
 * Invalidates list detail and list cache on success
 */
export function useUpdateList(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ListUpdate) => listApi.update(id, data),
    onSuccess: (updatedList) => {
      // Update the list in cache
      queryClient.setQueryData(['lists', id], updatedList);
      // Invalidate list cache to reflect changes
      queryClient.invalidateQueries({ queryKey: ['lists'], exact: false });
    },
  });
}

/**
 * Delete list
 * Invalidates lists cache on success
 */
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => listApi.delete(id),
    onSuccess: () => {
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}
