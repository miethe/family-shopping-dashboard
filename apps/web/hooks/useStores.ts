/**
 * Stores Hook
 *
 * React Query hooks for Store entity CRUD operations with cache management.
 * Provides store fetching, search, and creation functionality.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '@/lib/api/endpoints';
import type { Store, StoreCreate } from '@/types';

/**
 * Fetch all stores
 * @returns Query with list of all stores
 */
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => storeApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes - stores don't change frequently
    refetchOnWindowFocus: true,
  });
}

/**
 * Search stores by name
 * @param query - Search query string
 * @returns Query with matching stores (only runs if query length >= 2)
 */
export function useSearchStores(query: string) {
  return useQuery({
    queryKey: ['stores', 'search', query],
    queryFn: () => storeApi.search(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Get single store by ID
 * @param id - Store ID
 */
export function useStore(id: number) {
  return useQuery({
    queryKey: ['stores', id],
    queryFn: () => storeApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create new store
 * Invalidates stores cache on success
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreCreate) => storeApi.create(data),
    onSuccess: () => {
      // Invalidate all store queries to refetch
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * Delete store
 * Invalidates stores cache on success
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => storeApi.delete(id),
    onSuccess: () => {
      // Invalidate all store queries
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
