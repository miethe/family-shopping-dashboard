/**
 * Dashboard React Query Hook
 *
 * Fetches dashboard summary data with optimized caching for frequent updates.
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import type { DashboardResponse } from '@/types';

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.summary(),
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent than default)
    refetchOnWindowFocus: true,
  });
}
