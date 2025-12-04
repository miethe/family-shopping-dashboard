/**
 * Persons Hook
 *
 * React Query hooks for Person entity CRUD operations.
 * Provides list, create, update, delete functionality with cache management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personApi, PersonListParams } from '@/lib/api/endpoints';
import type { Person, PersonCreate, PersonUpdate } from '@/types';

interface UsePersonsOptions {
  enabled?: boolean;
}

/**
 * Fetch paginated list of persons
 * @param params - Optional cursor and limit for pagination
 */
export function usePersons(params?: PersonListParams, options: UsePersonsOptions = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: ['persons', params],
    queryFn: () => personApi.list(params),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled,
  });

  return query;
}

/**
 * Fetch single person by ID
 * @param id - Person ID
 */
export function usePerson(id: number) {
  const query = useQuery({
    queryKey: ['persons', id],
    queryFn: () => personApi.get(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  return query;
}

/**
 * Create new person
 * Invalidates persons list on success
 */
export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonCreate) => personApi.create(data),
    onSuccess: () => {
      // Invalidate all person queries to refetch
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}

/**
 * Update existing person
 * Invalidates person detail and list on success
 */
export function useUpdatePerson(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonUpdate) => personApi.update(id, data),
    onSuccess: (updatedPerson) => {
      // Update the person in cache
      queryClient.setQueryData(['persons', id], updatedPerson);
      // Invalidate list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['persons'], exact: false });
    },
  });
}

/**
 * Delete person
 * Invalidates persons list on success
 */
export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => personApi.delete(id),
    onSuccess: () => {
      // Invalidate all person queries
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}
