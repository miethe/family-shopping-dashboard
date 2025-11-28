/**
 * My Assignments Hook
 *
 * React Query hook for fetching list items assigned to the current user.
 * Provides filtering and grouping capabilities for assignment management.
 *
 * TODO: Backend needs GET /list-items?assigned_to=X endpoint.
 * Currently disabled - returns empty array.
 * See: https://github.com/family-gifting/dashboard/issues/TBD
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { ListItemWithGift } from '@/types';

/**
 * Extended ListItem with list context for assignments view
 */
export interface AssignmentItem extends ListItemWithGift {
  list?: {
    id: number;
    name: string;
    person_id?: number;
    person_name?: string;
  };
}

export interface AssignmentFilterParams {
  status?: string;
}

/**
 * Fetch all list items assigned to the current user
 * @param params - Optional filter parameters (status)
 *
 * NOTE: Currently returns empty array - backend endpoint not implemented.
 * Backend needs: GET /list-items?assigned_to=X or GET /users/{id}/assignments
 */
export function useMyAssignments(params?: AssignmentFilterParams) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assignments', 'me', params],
    queryFn: async () => {
      // TODO: Implement when backend supports GET /list-items?assigned_to=X
      // Currently no endpoint exists to query items by assigned user across all lists
      console.warn('useMyAssignments: Backend endpoint not implemented');
      return [] as AssignmentItem[];
    },
    enabled: !!user?.id,
  });
}

/**
 * Group assignments by list
 */
export function groupAssignmentsByList(assignments: AssignmentItem[]) {
  const grouped = new Map<number, { list: AssignmentItem['list']; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    if (!assignment.list) return;

    const listId = assignment.list.id;
    if (!grouped.has(listId)) {
      grouped.set(listId, {
        list: assignment.list,
        items: [],
      });
    }
    grouped.get(listId)!.items.push(assignment);
  });

  return Array.from(grouped.values());
}

/**
 * Group assignments by person
 */
export function groupAssignmentsByPerson(assignments: AssignmentItem[]) {
  const grouped = new Map<string, { personName: string; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    const personName = assignment.list?.person_name || 'Unknown';
    if (!grouped.has(personName)) {
      grouped.set(personName, {
        personName,
        items: [],
      });
    }
    grouped.get(personName)!.items.push(assignment);
  });

  return Array.from(grouped.values());
}
