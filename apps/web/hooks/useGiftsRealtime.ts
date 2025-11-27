/**
 * useGiftsRealtime Hook
 *
 * Example integration of React Query + WebSocket for real-time gift updates.
 * Demonstrates both cache invalidation and direct cache update patterns.
 *
 * This is an example file showing how to integrate useRealtimeSync
 * with existing React Query hooks.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useRealtimeSync } from './useRealtimeSync';
import { apiClient } from '@/lib/api/client';
import type { Gift } from '@/types';

export interface UseGiftsRealtimeOptions {
  /**
   * Gift list ID to fetch
   */
  listId?: string;

  /**
   * Enable real-time sync
   * Default: true
   */
  realtime?: boolean;

  /**
   * Use direct cache updates instead of invalidation
   * Default: false (invalidation is simpler and safer)
   */
  directCacheUpdate?: boolean;
}

/**
 * Fetch gifts with real-time synchronization
 *
 * Strategy 1: Cache Invalidation (default, recommended)
 * - Simple and safe
 * - Refetches data on any change
 * - Works for 2-3 users
 */
export function useGiftsRealtime(options: UseGiftsRealtimeOptions = {}) {
  const { listId, realtime = true, directCacheUpdate = false } = options;

  // Build query key
  const queryKey = listId ? ['gifts', listId] : ['gifts'];

  // Fetch gifts via REST
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (listId) {
        return apiClient.get<Gift[]>(`/gifts?list_id=${listId}`);
      }
      return apiClient.get<Gift[]>('/gifts');
    },
  });

  // Real-time sync with cache invalidation (default)
  useRealtimeSync({
    topic: listId ? `gift-list:${listId}` : 'gifts',
    queryKey,
    enabled: realtime && !directCacheUpdate,
  });

  // Real-time sync with direct cache update (advanced)
  useRealtimeSync({
    topic: listId ? `gift-list:${listId}` : 'gifts',
    queryKey,
    enabled: realtime && directCacheUpdate,
    onEvent: (event, queryClient) => {
      queryClient.setQueryData<Gift[]>(queryKey, (old = []) => {
        switch (event.event) {
          case 'ADDED':
            return [...old, event.data.payload as Gift];

          case 'UPDATED':
            return old.map((gift) =>
              String(gift.id) === event.data.entity_id
                ? { ...gift, ...(event.data.payload as Partial<Gift>) }
                : gift
            );

          case 'DELETED':
            return old.filter((gift) => String(gift.id) !== event.data.entity_id);

          default:
            return old;
        }
      });
    },
  });

  return query;
}

/**
 * Example: Single gift with real-time updates
 */
export function useGiftRealtime(giftId: string, options: { realtime?: boolean } = {}) {
  const { realtime = true } = options;

  const queryKey = ['gift', giftId];

  const query = useQuery({
    queryKey,
    queryFn: () => apiClient.get<Gift>(`/gifts/${giftId}`),
  });

  // Listen for updates to this specific gift
  useRealtimeSync({
    topic: `gift:${giftId}`,
    queryKey,
    enabled: realtime,
    events: ['UPDATED', 'DELETED', 'STATUS_CHANGED'],
  });

  return query;
}
