/**
 * Field Options Query Hook
 *
 * React Query hook for fetching field options with caching.
 */

import { useQuery } from '@tanstack/react-query';
import { fieldOptionsApi, FieldOptionsListResponse, FieldOptionDTO } from '@/lib/api/field-options';

interface UseFieldOptionsParams {
  entity: string;
  fieldName: string;
  includeInactive?: boolean;
  enabled?: boolean;
}

/**
 * Fetch field options for a given entity and field name
 * @param entity - Entity type (e.g., 'person', 'gift')
 * @param fieldName - Field name (e.g., 'relationship', 'category')
 * @param includeInactive - Include inactive options in results
 * @param enabled - Whether query is enabled (default: true)
 */
export function useFieldOptions({
  entity,
  fieldName,
  includeInactive = false,
  enabled = true,
}: UseFieldOptionsParams) {
  return useQuery<FieldOptionsListResponse>({
    queryKey: ['field-options', entity, fieldName, includeInactive],
    queryFn: () =>
      fieldOptionsApi.list({
        entity,
        field_name: fieldName,
        include_inactive: includeInactive,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    enabled,
  });
}

/**
 * Fetch single field option by ID
 * @param id - Field option ID
 */
export function useFieldOption(id: number) {
  return useQuery<FieldOptionDTO>({
    queryKey: ['field-options', 'detail', id],
    queryFn: () => fieldOptionsApi.get(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
