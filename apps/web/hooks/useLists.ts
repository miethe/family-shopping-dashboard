/**
 * Lists Hook
 *
 * React Query hooks for List entity CRUD operations.
 * Provides list, create, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listApi, ListListParams } from '@/lib/api/endpoints';
import type { GiftList, ListCreate, ListUpdate } from '@/types';

interface UseListsOptions {
  enabled?: boolean;
}

/**
 * Fetch paginated list of gift lists with optional filters
 * @param params - Optional cursor, limit, type, person_id, occasion_id
 */
export function useLists(params?: ListListParams, options: UseListsOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lists', params],
    queryFn: () => listApi.list(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
    refetchOnWindowFocus: true,
    enabled,
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
    refetchOnWindowFocus: true,
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
}

/**
 * Fetch lists filtered by person (recipient)
 * @param personId - Person ID to filter by
 * @param options - Query options (enabled)
 */
export function useListsForPerson(
  personId: number | undefined,
  options: UseListsForPersonOptions = {}
) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => listApi.list({ person_id: personId }),
    enabled: enabled && !!personId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
    refetchOnWindowFocus: true,
  });

  return query;
}

interface UseListsForOccasionOptions {
  enabled?: boolean;
}

/**
 * Fetch lists filtered by occasion
 * @param occasionId - Occasion ID to filter by
 * @param options - Query options (enabled)
 */
export function useListsForOccasion(
  occasionId: number | undefined,
  options: UseListsForOccasionOptions = {}
) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lists', 'occasion', occasionId],
    queryFn: () => listApi.list({ occasion_id: occasionId }),
    enabled: enabled && !!occasionId,
    staleTime: 1000 * 60 * 10, // 10 minutes - lists change infrequently
    refetchOnWindowFocus: true,
  });

  return query;
}

interface UseListsForGiftOptions {
  enabled?: boolean;
}

/**
 * Fetch lists that contain a specific gift
 * @param giftId - Gift ID to search for
 * @param options - Query options (enabled)
 *
 * Note: For V1 (2-3 users), this fetches all lists and filters client-side
 * by checking each list's items for the gift.
 * Future: Backend should support GET /lists?gift_id={id} for efficiency.
 */
export function useListsForGift(
  giftId: number | undefined,
  options: UseListsForGiftOptions = {}
) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['lists', 'gift', giftId],
    queryFn: async () => {
      if (!giftId) return { data: [], next_cursor: null };

      // Fetch all lists (reasonable for 2-3 users in V1)
      const response = await listApi.list({ limit: 100 });

      // Guard against excessive fan-out and aid debugging
      const totalLists = response.items.length;
      if (totalLists > 50) {
        console.warn(
          '[useListsForGift] Skipping gift filter because list count is high',
          { giftId, totalLists }
        );
        return { data: [], next_cursor: null };
      }

      // Fetch all list details in parallel (not sequential)
      const listsWithItems = await Promise.all(
        response.items.map((list) => listApi.get(list.id))
      );

      // Filter lists that contain this gift
      const listsWithGift = response.items.filter((list, index) => {
        const listWithItems = listsWithItems[index];
        return listWithItems.items.some((item) => item.gift.id === giftId);
      });

      console.debug('[useListsForGift] Filtered lists for gift', {
        giftId,
        totalLists,
        matched: listsWithGift.length,
      });

      return { data: listsWithGift, next_cursor: null };
    },
    enabled: enabled && !!giftId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
  });

  return query;
}
