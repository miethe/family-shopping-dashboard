/**
 * Groups Hook
 *
 * React Query hooks for Group entity CRUD operations.
 * Provides list, create, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '@/lib/api/endpoints';
import type { Group, GroupCreate, GroupUpdate } from '@/types';

/**
 * Fetch list of all groups
 */
export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => groupApi.list(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch single group by ID
 */
export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupApi.get(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });
}

/**
 * Create new group
 * Invalidates groups list on success
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GroupCreate) => groupApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/**
 * Update existing group
 * Invalidates group detail and list on success
 */
export function useUpdateGroup(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GroupUpdate) => groupApi.update(id, data),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(['groups', id], updatedGroup);
      queryClient.invalidateQueries({ queryKey: ['groups'], exact: false });
    },
  });
}

/**
 * Delete group
 * Invalidates groups list on success
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => groupApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
