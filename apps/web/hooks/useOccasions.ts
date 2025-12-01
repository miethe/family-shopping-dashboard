/**
 * Occasions Hook
 *
 * React Query hooks for Occasion entity CRUD operations.
 * Provides list, get, create, update, delete functionality with cache management.
 * Includes real-time sync via WebSocket.
 * Supports upcoming/past filtering and cursor-based pagination.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { occasionApi, OccasionListParams } from '@/lib/api/endpoints';
import type { Occasion, OccasionCreate, OccasionUpdate } from '@/types';
import { useRealtimeSync } from './useRealtimeSync';

/**
 * Fetch paginated list of occasions with optional filters
 * @param params - Optional cursor, limit, and filter (upcoming/past)
 */
export function useOccasions(params?: OccasionListParams) {
  const query = useQuery({
    queryKey: ['occasions', params],
    queryFn: () => occasionApi.list(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - occasions change infrequently
  });

  // Real-time sync for occasion list changes
  useRealtimeSync({
    topic: 'occasions',
    queryKey: ['occasions', params],
    events: ['ADDED', 'UPDATED', 'DELETED'],
  });

  return query;
}

/**
 * Fetch single occasion by ID
 * @param id - Occasion ID
 */
export function useOccasion(id: number) {
  const query = useQuery({
    queryKey: ['occasions', id],
    queryFn: () => occasionApi.get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes - occasion details rarely change
  });

  // Real-time sync for specific occasion changes
  useRealtimeSync({
    topic: id ? `occasion:${id}` : '',
    queryKey: ['occasions', id],
    events: ['UPDATED', 'DELETED'],
    enabled: !!id,
  });

  return query;
}

/**
 * Create new occasion
 * Invalidates occasions cache on success
 */
export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OccasionCreate) => occasionApi.create(data),
    onSuccess: () => {
      // Invalidate all occasion queries to refetch
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });
}

/**
 * Update existing occasion
 * Invalidates occasion detail and occasion cache on success
 */
export function useUpdateOccasion(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OccasionUpdate) => occasionApi.update(id, data),
    onSuccess: (updatedOccasion) => {
      // Update the occasion in cache
      queryClient.setQueryData(['occasions', id], updatedOccasion);
      // Invalidate occasion cache to reflect changes
      queryClient.invalidateQueries({ queryKey: ['occasions'], exact: false });
    },
  });
}

/**
 * Delete occasion
 * Invalidates occasions cache on success
 */
export function useDeleteOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => occasionApi.delete(id),
    onSuccess: () => {
      // Invalidate all occasion queries
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });
}
