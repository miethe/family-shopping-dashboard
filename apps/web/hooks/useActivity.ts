/**
 * Activity Feed React Query Hook
 *
 * Fetches recent activity feed with caching for frequent updates.
 */

import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/lib/api';
import type { ActivityFeedResponse } from '@/types';

export interface UseActivityOptions {
  limit?: number;
}

/**
 * Fetch recent activity feed
 * @param options - Query options including limit
 * @returns React Query result with activity events
 */
export function useRecentActivity(options: UseActivityOptions = {}) {
  const { limit = 10 } = options;

  return useQuery<ActivityFeedResponse>({
    queryKey: ['activity', 'recent', limit],
    queryFn: () => activityApi.recent({ limit }),
    staleTime: 1000 * 60 * 2, // 2 minutes - activity changes frequently
    refetchOnWindowFocus: true,
  });
}
