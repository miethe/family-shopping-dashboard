/**
 * useRealtimeSync Hook
 *
 * Combines useWebSocket with React Query for real-time cache synchronization.
 * Provides two strategies:
 * 1. Cache Invalidation (default) - Invalidate and refetch on events
 * 2. Direct Cache Update - Update cache directly with event payload
 *
 * Usage:
 * ```tsx
 * // Strategy 1: Cache Invalidation (simplest)
 * useRealtimeSync({
 *   topic: 'gift-list:123',
 *   queryKey: ['gifts', '123'],
 * });
 *
 * // Strategy 2: Direct Cache Update
 * useRealtimeSync({
 *   topic: 'gift-list:123',
 *   queryKey: ['gifts', '123'],
 *   onEvent: (event, queryClient) => {
 *     queryClient.setQueryData(['gifts', '123'], (old: Gift[]) => {
 *       if (event.event === 'ADDED') {
 *         return [...old, event.data.payload];
 *       }
 *       // ... handle other events
 *       return old;
 *     });
 *   },
 * });
 * ```
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient, QueryKey } from '@tanstack/react-query';
import { useWebSocketContext } from '@/lib/websocket/WebSocketProvider';
import type { WSEvent, WSEventType } from '@/lib/websocket/types';

export interface UseRealtimeSyncOptions {
  /**
   * WebSocket topic to subscribe to
   * Format: "resource:id" (e.g., "gift-list:123")
   */
  topic: string;

  /**
   * React Query key to invalidate on events
   */
  queryKey: QueryKey;

  /**
   * Event types to listen for
   * Default: ['ADDED', 'UPDATED', 'DELETED', 'STATUS_CHANGED']
   */
  events?: WSEventType[];

  /**
   * Custom event handler
   * If provided, will be called instead of default invalidation
   * Use this for direct cache updates
   */
  onEvent?: (event: WSEvent, queryClient: ReturnType<typeof useQueryClient>) => void;

  /**
   * Debounce invalidation in milliseconds
   * Useful for high-frequency events
   * Default: 0 (no debounce)
   */
  debounceMs?: number;

  /**
   * Enable/disable sync
   * Default: true
   */
  enabled?: boolean;

  /**
   * Callback when subscription is active
   */
  onSubscribed?: () => void;

  /**
   * Callback when subscription is removed
   */
  onUnsubscribed?: () => void;
}

export function useRealtimeSync(options: UseRealtimeSyncOptions): void {
  const {
    topic,
    queryKey,
    events = ['ADDED', 'UPDATED', 'DELETED', 'STATUS_CHANGED'],
    onEvent,
    debounceMs = 0,
    enabled = true,
    onSubscribed,
    onUnsubscribed,
  } = options;

  const queryClient = useQueryClient();
  const { subscribe, state } = useWebSocketContext();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle incoming WebSocket event
   */
  const handleEvent = useCallback(
    (event: WSEvent) => {
      // Filter by event type
      if (!events.includes(event.event)) {
        return;
      }

      // Custom handler if provided
      if (onEvent) {
        onEvent(event, queryClient);
        return;
      }

      // Default: invalidate query with debouncing
      const invalidate = () => {
        queryClient.invalidateQueries({ queryKey });
      };

      if (debounceMs > 0) {
        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new timer
        debounceTimerRef.current = setTimeout(invalidate, debounceMs);
      } else {
        // Immediate invalidation
        invalidate();
      }
    },
    [events, onEvent, queryClient, queryKey, debounceMs]
  );

  /**
   * Subscribe to WebSocket topic
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const unsubscribe = subscribe(topic, handleEvent);

    // Call onSubscribed callback
    if (onSubscribed && state === 'connected') {
      onSubscribed();
    }

    return () => {
      unsubscribe();

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Call onUnsubscribed callback
      if (onUnsubscribed) {
        onUnsubscribed();
      }
    };
  }, [enabled, topic, subscribe, handleEvent, state, onSubscribed, onUnsubscribed]);
}

/**
 * Polling fallback hook
 *
 * Provides polling fallback when WebSocket is unavailable.
 * Automatically stops polling when WebSocket connects.
 *
 * Usage:
 * ```tsx
 * usePollingFallback({
 *   queryKey: ['gifts', '123'],
 *   intervalMs: 10000, // 10s
 * });
 * ```
 */
export interface UsePollingFallbackOptions {
  /**
   * React Query key to refetch
   */
  queryKey: QueryKey;

  /**
   * Polling interval in milliseconds
   * Default: 10000 (10s)
   */
  intervalMs?: number;

  /**
   * Enable/disable polling
   * Default: true when WebSocket is not connected
   */
  enabled?: boolean;
}

export function usePollingFallback(options: UsePollingFallbackOptions): void {
  const { queryKey, intervalMs = 10000, enabled = true } = options;

  const queryClient = useQueryClient();
  const { state } = useWebSocketContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only poll if enabled and WebSocket is not connected
    const shouldPoll = enabled && state !== 'connected';

    if (shouldPoll) {
      // Start polling
      intervalRef.current = setInterval(() => {
        queryClient.invalidateQueries({ queryKey });
      }, intervalMs);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Stop polling if WebSocket is connected
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [enabled, state, queryKey, intervalMs, queryClient]);
}

/**
 * Helper: Optimistic update with rollback
 *
 * Performs optimistic update and provides rollback on error.
 *
 * Usage:
 * ```tsx
 * const { mutate } = useMutation({
 *   mutationFn: updateGift,
 *   onMutate: async (newGift) => {
 *     const rollback = await optimisticUpdate(
 *       queryClient,
 *       ['gifts', '123'],
 *       (old: Gift[]) => old.map(g => g.id === newGift.id ? newGift : g)
 *     );
 *     return { rollback };
 *   },
 *   onError: (err, variables, context) => {
 *     context?.rollback();
 *   },
 * });
 * ```
 */
export async function optimisticUpdate<T>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: QueryKey,
  updater: (old: T) => T
): Promise<() => void> {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot current value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  if (previousData !== undefined) {
    queryClient.setQueryData<T>(queryKey, updater(previousData));
  }

  // Return rollback function
  return () => {
    if (previousData !== undefined) {
      queryClient.setQueryData<T>(queryKey, previousData);
    }
  };
}
