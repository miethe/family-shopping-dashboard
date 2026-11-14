/**
 * Budget Meter Hook
 *
 * React Query hooks for budget meter operations.
 * Tracks budget allocation and spending progress per occasion.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/lib/api';
import type {
  BudgetMeterData,
  BudgetWarning,
  EntityBudget,
  SetBudgetRequest,
  SetEntityBudgetRequest,
} from '@/types';

// ============================================================================
// Query Key Factory
// ============================================================================

export const budgetKeys = {
  all: ['budgets'] as const,
  meter: (occasionId: number) => ['budgets', 'meter', occasionId] as const,
  warning: (occasionId: number) => ['budgets', 'warning', occasionId] as const,
  entities: (occasionId: number) => ['budgets', 'entities', occasionId] as const,
  entity: (occasionId: number, entityType: string, entityId: number) =>
    ['budgets', 'entity', occasionId, entityType, entityId] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch budget meter data for an occasion
 *
 * Shows overall budget status including:
 * - Total budget allocated
 * - Amount spent (purchased items)
 * - Amount planned (selected items)
 * - Remaining budget
 * - Progress percentages
 */
export function useBudgetMeter(occasionId: number | undefined) {
  return useQuery({
    queryKey: budgetKeys.meter(occasionId!),
    queryFn: () => budgetsApi.getMeter(occasionId!),
    enabled: !!occasionId,
    staleTime: 1000 * 60 * 5, // 5 minutes (moderate updates)
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch budget warning status
 *
 * Returns warning level and message based on spending:
 * - 'none': Under 60%
 * - 'approaching': 60-80%
 * - 'near_limit': 80-100%
 * - 'exceeded': Over 100%
 */
export function useBudgetWarning(occasionId: number | undefined) {
  return useQuery({
    queryKey: budgetKeys.warning(occasionId!),
    queryFn: () => budgetsApi.getWarning(occasionId!),
    enabled: !!occasionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Fetch all entity-specific budgets for an occasion
 *
 * Returns budgets for individual lists and persons within the occasion.
 * Useful for showing budget breakdown by category.
 */
export function useEntityBudgets(occasionId: number | undefined) {
  return useQuery({
    queryKey: budgetKeys.entities(occasionId!),
    queryFn: () => budgetsApi.getEntityBudgets(occasionId!),
    enabled: !!occasionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a specific entity budget
 *
 * Gets budget for a single list or person within an occasion.
 */
export function useEntityBudget(
  occasionId: number | undefined,
  entityType: string | undefined,
  entityId: number | undefined
) {
  return useQuery({
    queryKey: budgetKeys.entity(occasionId!, entityType!, entityId!),
    queryFn: () => budgetsApi.getEntityBudget(occasionId!, entityType!, entityId!),
    enabled: !!occasionId && !!entityType && !!entityId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Set or update occasion budget
 *
 * Updates the total budget for an occasion.
 * Invalidates meter, warning, and related caches on success.
 */
export function useSetOccasionBudget(occasionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetBudgetRequest) => budgetsApi.setOccasionBudget(occasionId, data),
    onSuccess: (updatedMeter) => {
      // Update cache with new meter data
      queryClient.setQueryData(budgetKeys.meter(occasionId), updatedMeter);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.warning(occasionId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.entities(occasionId) });
      queryClient.invalidateQueries({ queryKey: ['occasions', occasionId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Set or update entity-specific budget
 *
 * Sets budget for a specific list or person within an occasion.
 * Invalidates entity budgets list and meter on success.
 */
export function useSetEntityBudget(occasionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetEntityBudgetRequest) => budgetsApi.setEntityBudget(occasionId, data),
    onSuccess: (updatedEntity) => {
      // Update specific entity cache
      queryClient.setQueryData(
        budgetKeys.entity(occasionId, updatedEntity.entity_type, updatedEntity.entity_id),
        updatedEntity
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.entities(occasionId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.meter(occasionId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.warning(occasionId) });
    },
  });
}

/**
 * Delete an entity-specific budget
 *
 * Removes budget allocation for a list or person.
 * Returns budget to the occasion-level pool.
 */
export function useDeleteEntityBudget(occasionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, entityId }: { entityType: string; entityId: number }) =>
      budgetsApi.deleteEntityBudget(occasionId, entityType, entityId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: budgetKeys.entity(occasionId, variables.entityType, variables.entityId),
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: budgetKeys.entities(occasionId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.meter(occasionId) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.warning(occasionId) });
    },
  });
}

// ============================================================================
// Combined Hooks
// ============================================================================

/**
 * Combined hook for budget meter with warning
 *
 * Fetches both meter and warning data in parallel.
 * Useful for displaying budget status with visual warnings.
 */
export function useBudgetMeterWithWarning(occasionId: number | undefined) {
  const meter = useBudgetMeter(occasionId);
  const warning = useBudgetWarning(occasionId);

  return {
    meter: meter.data,
    warning: warning.data,
    isLoading: meter.isLoading || warning.isLoading,
    isError: meter.isError || warning.isError,
    error: meter.error || warning.error,
    refetch: () => {
      meter.refetch();
      warning.refetch();
    },
  };
}

/**
 * Full budget overview for an occasion
 *
 * Fetches meter, warning, and all entity budgets.
 * Useful for comprehensive budget management UI.
 */
export function useBudgetOverview(occasionId: number | undefined) {
  const meter = useBudgetMeter(occasionId);
  const warning = useBudgetWarning(occasionId);
  const entities = useEntityBudgets(occasionId);

  return {
    meter: meter.data,
    warning: warning.data,
    entities: entities.data,
    isLoading: meter.isLoading || warning.isLoading || entities.isLoading,
    isError: meter.isError || warning.isError || entities.isError,
    error: meter.error || warning.error || entities.error,
    refetch: () => {
      meter.refetch();
      warning.refetch();
      entities.refetch();
    },
  };
}
