/**
 * useOccasion Hook
 *
 * React Query hooks for individual occasion operations.
 * Handles fetching, updating, and deleting occasions with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { occasionApi } from '@/lib/api';
import type { OccasionCreate, OccasionUpdate } from '@/types';

/**
 * Fetch a single occasion by ID
 */
export function useOccasion(id: number) {
  return useQuery({
    queryKey: ['occasions', id],
    queryFn: () => occasionApi.get(id),
    enabled: !!id,
  });
}

/**
 * Update an occasion
 * Invalidates both the individual occasion and the occasions list cache
 */
export function useUpdateOccasion(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OccasionUpdate) => occasionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions', id] });
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });
}

/**
 * Delete an occasion
 * Invalidates the occasions list cache
 */
export function useDeleteOccasion(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => occasionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });
}

/**
 * Create a new occasion
 * Invalidates the occasions list cache
 */
export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OccasionCreate) => occasionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] });
    },
  });
}
