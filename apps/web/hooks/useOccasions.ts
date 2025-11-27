/**
 * useOccasions Hook
 *
 * React Query hook for fetching paginated occasions with filter support.
 * Supports upcoming/past filtering and cursor-based pagination.
 */

import { useQuery } from '@tanstack/react-query';
import { occasionApi, type OccasionListParams } from '@/lib/api';

export function useOccasions(filter?: 'upcoming' | 'past', cursor?: number) {
  return useQuery({
    queryKey: ['occasions', filter, cursor],
    queryFn: () => {
      const params: OccasionListParams = {};
      if (filter) params.filter = filter;
      if (cursor) params.cursor = cursor;
      return occasionApi.list(params);
    },
  });
}
