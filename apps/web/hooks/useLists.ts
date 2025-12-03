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

interface UseListsForPersonOptions {
  enabled?: boolean;
  disableRealtime?: boolean;
}

/**
 * Fetch lists filtered by person (recipient)
 * @param personId - Person ID to filter by
 * @param options - Query options (enabled, disableRealtime)
 */
export function useListsForPerson(
  personId: number | undefined,
  options: UseListsForPersonOptions = {}
) {
  const { enabled = true, disableRealtime = false } = options;

  const query = useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => listApi.list({ person_id: personId }),
    enabled: enabled && !!personId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
  });

  // Real-time sync for person-specific lists
  useRealtimeSync({
    topic: personId ? `person:${personId}:lists` : '',
    queryKey: ['lists', 'person', personId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: enabled && !!personId && !disableRealtime,
  });

  return query;
}

interface UseListsForOccasionOptions {
  enabled?: boolean;
  disableRealtime?: boolean;
}

/**
 * Fetch lists filtered by occasion
 * @param occasionId - Occasion ID to filter by
 * @param options - Query options (enabled, disableRealtime)
 */
export function useListsForOccasion(
  occasionId: number | undefined,
  options: UseListsForOccasionOptions = {}
) {
  const { enabled = true, disableRealtime = false } = options;

  const query = useQuery({
    queryKey: ['lists', 'occasion', occasionId],
    queryFn: () => listApi.list({ occasion_id: occasionId }),
    enabled: enabled && !!occasionId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
  });

  // Real-time sync for occasion-specific lists
  useRealtimeSync({
    topic: occasionId ? `occasion:${occasionId}:lists` : '',
    queryKey: ['lists', 'occasion', occasionId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: enabled && !!occasionId && !disableRealtime,
  });

  return query;
}

interface UseListsForGiftOptions {
  enabled?: boolean;
  disableRealtime?: boolean;
}

/**
 * Fetch lists that contain a specific gift
 * @param giftId - Gift ID to search for
 * @param options - Query options (enabled, disableRealtime)
 *
 * Note: For V1 (2-3 users), this fetches all lists and filters client-side
 * by checking each list's items for the gift.
 * Future: Backend should support GET /lists?gift_id={id} for efficiency.
 */
export function useListsForGift(
  giftId: number | undefined,
  options: UseListsForGiftOptions = {}
) {
  const { enabled = true, disableRealtime = false } = options;

  const query = useQuery({
    queryKey: ['lists', 'gift', giftId],
    queryFn: async () => {
      if (!giftId) return { data: [], next_cursor: null };

      // Fetch all lists (reasonable for 2-3 users in V1)
      const response = await listApi.list({ limit: 100 });

      // Fetch all list details in parallel (not sequential)
      const listsWithItems = await Promise.all(
        response.items.map((list) => listApi.get(list.id))
      );

      // Filter lists that contain this gift
      const listsWithGift = response.items.filter((list, index) => {
        const listWithItems = listsWithItems[index];
        return listWithItems.items.some((item) => item.gift.id === giftId);
      });

      return { data: listsWithGift, next_cursor: null };
    },
    enabled: enabled && !!giftId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Real-time sync for gift-specific lists
  // When any list changes, we need to refetch to see if it now includes/excludes this gift
  useRealtimeSync({
    topic: 'lists',
    queryKey: ['lists', 'gift', giftId],
    events: ['ADDED', 'UPDATED', 'DELETED'],
    enabled: enabled && !!giftId && !disableRealtime,
  });

  return query;
}
