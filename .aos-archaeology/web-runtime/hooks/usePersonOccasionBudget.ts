/**
 * Person-Occasion Budget Hooks
 *
 * React Query hooks for managing person-occasion budgets.
 * These budgets set spending limits for a person's roles (recipient/purchaser) within a specific occasion.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personApi } from '@/lib/api/endpoints';
import type { PersonOccasionBudget, PersonOccasionBudgetUpdate } from '@/types/budget';

/**
 * Query key factory for person-occasion budgets
 */
export const personOccasionBudgetKeys = {
  all: ['person-occasion-budgets'] as const,
  detail: (personId: number, occasionId: number) =>
    [...personOccasionBudgetKeys.all, personId, occasionId] as const,
};

/**
 * Hook to fetch budget for a person-occasion pair
 *
 * @param personId - Person ID
 * @param occasionId - Occasion ID
 * @returns Query result with PersonOccasionBudget data
 *
 * @example
 * ```tsx
 * const { data: budget, isLoading } = usePersonOccasionBudget(1, 5);
 * if (budget) {
 *   console.log(`Recipient budget: ${budget.recipient_budget_total}`);
 *   console.log(`Recipient spent: ${budget.recipient_spent}`);
 * }
 * ```
 */
export function usePersonOccasionBudget(personId: number, occasionId: number) {
  return useQuery({
    queryKey: personOccasionBudgetKeys.detail(personId, occasionId),
    queryFn: () => personApi.getOccasionBudget(personId, occasionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!personId && !!occasionId,
  });
}

/**
 * Hook to update budget for a person-occasion pair with optimistic updates
 *
 * @param personId - Person ID
 * @param occasionId - Occasion ID
 * @returns Mutation hook with optimistic update support
 *
 * @example
 * ```tsx
 * const updateBudget = useUpdatePersonOccasionBudget(1, 5);
 *
 * const handleSave = () => {
 *   updateBudget.mutate({
 *     recipient_budget_total: 500,
 *     purchaser_budget_total: 300,
 *   });
 * };
 * ```
 */
export function useUpdatePersonOccasionBudget(personId: number, occasionId: number) {
  const queryClient = useQueryClient();
  const queryKey = personOccasionBudgetKeys.detail(personId, occasionId);

  return useMutation({
    mutationFn: (data: PersonOccasionBudgetUpdate) =>
      personApi.updateOccasionBudget(personId, occasionId, data),

    // Optimistic update
    onMutate: async (newBudget) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previous = queryClient.getQueryData<PersonOccasionBudget>(queryKey);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<PersonOccasionBudget>(queryKey, {
          ...previous,
          recipient_budget_total:
            newBudget.recipient_budget_total !== undefined
              ? newBudget.recipient_budget_total
              : previous.recipient_budget_total,
          purchaser_budget_total:
            newBudget.purchaser_budget_total !== undefined
              ? newBudget.purchaser_budget_total
              : previous.purchaser_budget_total,
        });
      }

      return { previous };
    },

    // Rollback on error
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      // Invalidate this budget
      queryClient.invalidateQueries({ queryKey });

      // Also invalidate person budget (global totals may change)
      queryClient.invalidateQueries({
        queryKey: ['persons', personId, 'budgets', occasionId],
      });

      // Invalidate occasion details (may show budget summary)
      queryClient.invalidateQueries({
        queryKey: ['occasions', occasionId],
      });
    },
  });
}
