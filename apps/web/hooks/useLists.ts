/**
 * Lists Hook
 *
 * React Query hooks for List entity CRUD operations.
 * Provides list, create, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listApi, ListListParams } from '@/lib/api/endpoints';
import type { GiftList, ListCreate, ListUpdate } from '@/types';
import { useRealtimeSync } from './useRealtimeSync';

interface UseListsOptions {
  enabled?: boolean;
  disableRealtime?: boolean;
}

/**
 * Fetch paginated list of gift lists with optional filters
 * @param params - Optional cursor, limit, type, person_id, occasion_id
 */
export function useLists(params?: ListListParams, options: UseListsOptions = {}) {
  const { enabled = true, disableRealtime = false } = options;

  const query = useQuery({
    queryKey: ['lists', params],
    queryFn: () => listApi.list(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently, real-time sync
    enabled,
  });

  // Real-time sync for list metadata changes
  // Subscribe to a general lists topic for new lists, deletions, etc.
  useRealtimeSync({
    topic: 'lists',
    queryKey: ['lists', params],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: enabled && !disableRealtime,
  });

  return query;
}

/**
 * Fetch single list by ID with items
 * @param id - List ID
 */
export function useList(id: number) {
  const query = useQuery({
    queryKey: ['lists', id],
    queryFn: () => listApi.get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - list metadata rarely changes
  });

  // Real-time sync for specific list changes
  useRealtimeSync({
    topic: id ? `list:${id}` : '',
    queryKey: ['lists', id],
    events: ['UPDATED', 'DELETED'],
    enabled: !!id,
  });

  return query;
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

/**
 * Fetch lists filtered by person (recipient)
 * @param personId - Person ID to filter by
 */
export function useListsForPerson(personId: number | undefined) {
  const query = useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => listApi.list({ person_id: personId }),
    enabled: !!personId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
  });

  // Real-time sync for person-specific lists
  useRealtimeSync({
    topic: personId ? `person:${personId}:lists` : '',
    queryKey: ['lists', 'person', personId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: !!personId,
  });

  return query;
}

/**
 * Fetch lists filtered by occasion
 * @param occasionId - Occasion ID to filter by
 */
export function useListsForOccasion(occasionId: number | undefined) {
  const query = useQuery({
    queryKey: ['lists', 'occasion', occasionId],
    queryFn: () => listApi.list({ occasion_id: occasionId }),
    enabled: !!occasionId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
  });

  // Real-time sync for occasion-specific lists
  useRealtimeSync({
    topic: occasionId ? `occasion:${occasionId}:lists` : '',
    queryKey: ['lists', 'occasion', occasionId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: !!occasionId,
  });

  return query;
}

/**
 * Fetch lists that contain a specific gift
 * @param giftId - Gift ID to search for
 *
 * Note: For V1 (2-3 users), this fetches all lists and filters client-side
 * by checking each list's items for the gift.
 * Future: Backend should support GET /lists?gift_id={id} for efficiency.
 */
export function useListsForGift(giftId: number | undefined) {
  const query = useQuery({
    queryKey: ['lists', 'gift', giftId],
    queryFn: async () => {
      if (!giftId) return { data: [], next_cursor: null };

      // Fetch all lists (reasonable for 2-3 users in V1)
      const response = await listApi.list({ limit: 100 });

      // Filter lists that contain this gift
      // We need to check each list's items, so we'll fetch list details
      const listsWithGift: GiftList[] = [];

      for (const list of response.items) {
        // Fetch full list with items
        const listWithItems = await listApi.get(list.id);

        // Check if any item contains the gift
        if (listWithItems.items.some((item) => item.gift.id === giftId)) {
          listsWithGift.push(list);
        }
      }

      return { data: listsWithGift, next_cursor: null };
    },
    enabled: !!giftId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Real-time sync for gift-specific lists
  // When any list changes, we need to refetch to see if it now includes/excludes this gift
  useRealtimeSync({
    topic: 'lists',
    queryKey: ['lists', 'gift', giftId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: !!giftId,
  });

  return query;
}
