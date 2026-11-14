/**
 * Person Budget Hook
 *
 * React Query hook for fetching person budget data.
 * Shows gifts assigned TO person (as recipient) and gifts purchased BY person (as purchaser).
 */

import { useQuery } from '@tanstack/react-query';
import { personApi } from '@/lib/api/endpoints';
import type { PersonBudget } from '@/types/budget';

interface UsePersonBudgetOptions {
  enabled?: boolean;
}

/**
 * Fetch person budget data showing:
 * - Gifts assigned TO this person (as recipient)
 * - Gifts purchased BY this person (as purchaser)
 *
 * @param personId - Person ID to fetch budget for
 * @param occasionId - Optional occasion ID to filter budget
 * @param options - Additional query options
 */
export function usePersonBudget(
  personId: number,
  occasionId?: number,
  options: UsePersonBudgetOptions = {}
) {
  const { enabled = true } = options;

  const query = useQuery<PersonBudget>({
    queryKey: ['persons', personId, 'budgets', occasionId],
    queryFn: () => personApi.getBudget(personId, occasionId),
    enabled: enabled && !!personId,
    staleTime: 1000 * 60 * 5, // 5 minutes - budget data is semi-static
    refetchOnWindowFocus: true,
  });

  return query;
}
