/**
 * Gifts Hook
 *
 * React Query hooks for Gift entity CRUD operations with cache management.
 * Provides gift fetching, create, update, delete, and URL-based creation functionality.
 * Supports filtering by person, occasion, list, status, and more.
 */

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { giftApi, GiftListParams } from '@/lib/api/endpoints';
import type { PaginatedResponse } from '@/lib/api/types';
import type { Gift, GiftCreate, GiftUpdate } from '@/types';

interface UseGiftsOptions {
  enabled?: boolean;
}

/**
 * Update all cached queries that contain the given gift.
 * Ensures list views and detail modals pick up the latest status immediately.
 */
export const syncGiftCaches = (queryClient: QueryClient, updatedGift: Gift) => {
  // Detail cache
  queryClient.setQueryData(['gifts', updatedGift.id], updatedGift);

  // Any list query with items[]
  queryClient.setQueriesData<PaginatedResponse<Gift>>(
    { queryKey: ['gifts'], exact: false },
    (existing) => {
      if (!existing || !Array.isArray((existing as any).items)) return existing;
      const items = existing.items.map((gift) =>
        gift.id === updatedGift.id ? { ...gift, ...updatedGift } : gift
      );
      return { ...existing, items };
    }
  );
};

/**
 * Fetch paginated list of gifts with optional filters
 * @param params - Optional cursor, limit, search, tags, person_ids, statuses, list_ids, occasion_ids filters
 */
export function useGifts(params?: GiftListParams, options: UseGiftsOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes - moderate updates, search-heavy
    refetchOnWindowFocus: true,
    enabled,
  });

  return query;
}

/**
 * Fetch gifts linked to a specific person
 * Convenience wrapper around useGifts with person_ids filter
 * @param personId - Person ID to filter by
 * @param options - Additional query options
 */
export function useGiftsByPerson(personId: number, options: UseGiftsOptions = {}) {
  return useGifts(
    { person_ids: [personId] },
    { ...options, enabled: options.enabled !== false && !!personId }
  );
}

/**
 * Fetch single gift by ID
 * @param id - Gift ID
 */
export function useGift(id: number) {
  const query = useQuery({
    queryKey: ['gifts', id],
    queryFn: () => giftApi.get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes - detail pages benefit from caching
    refetchOnWindowFocus: true,
  });

  return query;
}

/**
 * Create new gift manually
 * Invalidates gifts cache on success
 */
export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftCreate) => giftApi.create(data),
    onSuccess: () => {
      // Invalidate all gift queries to refetch
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

/**
 * Create gift from URL with automatic metadata parsing
 * Invalidates gifts cache on success
 */
export function useGiftFromUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => giftApi.createFromUrl({ url }),
    onSuccess: () => {
      // Invalidate all gift queries to refetch
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

/**
 * Update existing gift
 * Invalidates gift detail and gift cache on success
 * Also invalidates person-filtered queries if person_ids changed
 */
export function useUpdateGift(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftUpdate) => giftApi.update(id, data),
    onSuccess: (updatedGift) => {
      syncGiftCaches(queryClient, updatedGift);
      // Invalidate to stay in sync with any filtered queries
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}

/**
 * Delete gift
 * Invalidates gifts cache on success
 */
export function useDeleteGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => giftApi.delete(id),
    onSuccess: () => {
      // Invalidate all gift queries
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}

/**
 * Attach people to a gift
 * Invalidates gift detail and all gift queries on success
 * @param giftId - Gift ID to attach people to
 */
export function useAttachPeopleToGift(giftId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personIds: number[]) => giftApi.attachPeople(giftId, personIds),
    onSuccess: (updatedGift) => {
      // Update the gift in cache
      queryClient.setQueryData(['gifts', giftId], updatedGift);
      // Invalidate all gift queries to reflect changes in lists
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}

/**
 * Detach person from a gift
 * Invalidates gift detail and all gift queries on success
 * @param giftId - Gift ID to detach person from
 */
export function useDetachPersonFromGift(giftId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personId: number) => giftApi.detachPerson(giftId, personId),
    onSuccess: (updatedGift) => {
      // Update the gift in cache
      queryClient.setQueryData(['gifts', giftId], updatedGift);
      // Invalidate all gift queries to reflect changes in lists
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}

/**
 * Mark gift as purchased
 * Invalidates gift detail and all gift queries on success
 * @param giftId - Gift ID to mark as purchased
 */
export function useMarkGiftPurchased(giftId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { quantity_purchased?: number }) => giftApi.markPurchased(giftId, data),
    onSuccess: (updatedGift) => {
      syncGiftCaches(queryClient, updatedGift);
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}
