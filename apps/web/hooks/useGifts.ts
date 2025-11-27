/**
 * Gifts Hook
 *
 * React Query hooks for Gift entity CRUD operations with cache management.
 * Provides gift fetching, create, update, delete, and URL-based creation functionality.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { giftApi, GiftListParams } from '@/lib/api/endpoints';
import type { Gift, GiftCreate, GiftUpdate } from '@/types';

/**
 * Fetch paginated list of gifts with optional filters
 * @param params - Optional cursor, limit, search, tags filters
 */
export function useGifts(params?: GiftListParams) {
  return useQuery({
    queryKey: ['gifts', params],
    queryFn: () => giftApi.list(params),
  });
}

/**
 * Fetch single gift by ID
 * @param id - Gift ID
 */
export function useGift(id: number) {
  return useQuery({
    queryKey: ['gifts', id],
    queryFn: () => giftApi.get(id),
    enabled: !!id,
  });
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
 */
export function useUpdateGift(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftUpdate) => giftApi.update(id, data),
    onSuccess: (updatedGift) => {
      // Update the gift in cache
      queryClient.setQueryData(['gifts', id], updatedGift);
      // Invalidate gift cache to reflect changes
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
