/**
 * Field Options Mutation Hooks
 *
 * React Query mutations for creating, updating, and deleting field options.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fieldOptionsApi,
  FieldOptionCreate,
  FieldOptionUpdate,
} from '@/lib/api/field-options';

interface MutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new field option
 * @param entity - Entity type to create option for
 * @param fieldName - Field name to create option for
 * @param callbacks - Optional success/error callbacks
 */
export function useCreateFieldOption(
  entity: string,
  fieldName: string,
  callbacks?: MutationCallbacks
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FieldOptionCreate) => fieldOptionsApi.create(data),
    onSuccess: () => {
      // Invalidate list query to refetch
      queryClient.invalidateQueries({
        queryKey: ['field-options', entity, fieldName],
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
}

/**
 * Update an existing field option
 * @param optionId - ID of the field option to update
 * @param callbacks - Optional success/error callbacks
 */
export function useUpdateFieldOption(
  optionId: number,
  callbacks?: MutationCallbacks
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FieldOptionUpdate) =>
      fieldOptionsApi.update(optionId, data),
    onSuccess: () => {
      // Invalidate both detail and all list queries
      queryClient.invalidateQueries({
        queryKey: ['field-options', 'detail', optionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['field-options'],
        exact: false,
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
}

/**
 * Delete a field option (soft or hard delete)
 * @param optionId - ID of the field option to delete
 * @param callbacks - Optional success/error callbacks
 */
export function useDeleteFieldOption(
  optionId: number,
  callbacks?: MutationCallbacks
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hardDelete = false }: { hardDelete?: boolean }) =>
      fieldOptionsApi.delete(optionId, hardDelete),
    onSuccess: () => {
      // Invalidate all field-options queries
      queryClient.invalidateQueries({
        queryKey: ['field-options'],
      });
      callbacks?.onSuccess?.();
    },
    onError: (error: Error) => {
      callbacks?.onError?.(error);
    },
  });
}
