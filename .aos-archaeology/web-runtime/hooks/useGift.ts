/**
 * Gift Hook
 *
 * React Query hooks for individual Gift entity operations.
 * Provides get, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { giftApi } from '@/lib/api/endpoints';
import { syncGiftCaches } from './useGifts';
import type { Gift, GiftUpdate } from '@/types';

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
 * Update existing gift
 * Invalidates gift detail and list on success
 */
export function useUpdateGift(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftUpdate) => giftApi.update(id, data),
    onSuccess: (updatedGift) => {
      syncGiftCaches(queryClient, updatedGift);
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}

/**
 * Delete gift
 * Invalidates gifts list on success
 */
export function useDeleteGift(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => giftApi.delete(id),
    onSuccess: () => {
      // Invalidate all gift queries
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}
