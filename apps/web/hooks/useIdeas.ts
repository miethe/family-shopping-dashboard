/**
 * Ideas Hook
 *
 * React Query hooks for Idea Inbox API operations.
 * Provides idea list and add-to-list functionality.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useRealtimeSync } from './useRealtimeSync';
import type { Gift } from '@/types';

/**
 * Idea Inbox Response from API
 */
export interface IdeaInboxResponse {
  ideas: Array<{
    id: number;
    name: string;
    image_url: string | null;
    price: number | null;
    created_at: string;
    added_by: {
      id: number;
      email: string;
    };
  }>;
  total: number;
}

/**
 * Idea item for UI consumption
 */
export interface IdeaItem {
  id: number;
  name: string;
  image_url: string | null;
  price: number | null;
  created_at: string;
  added_by: {
    id: number;
    email: string;
  };
}

/**
 * Fetch idea inbox with optional limit
 * @param limit - Maximum number of ideas to fetch (default: 10)
 */
export function useIdeaInbox(limit = 10) {
  const query = useQuery<IdeaInboxResponse>({
    queryKey: ['ideas', 'inbox', limit],
    queryFn: () => apiClient.get<IdeaInboxResponse>(`/ideas/inbox?limit=${limit}`),
    staleTime: 1000 * 60 * 5, // 5 minutes - ideas change occasionally
  });

  // Real-time sync for new ideas
  useRealtimeSync({
    topic: 'ideas:inbox',
    queryKey: ['ideas', 'inbox', limit],
    events: ['ADDED', 'UPDATED', 'DELETED'],
  });

  return query;
}

/**
 * Add idea to a list
 * Creates a gift from the idea and adds it to the specified list
 */
export function useAddIdeaToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ideaId,
      listId,
    }: {
      ideaId: number;
      listId: number;
    }) => {
      // Add idea to list via API endpoint
      return apiClient.post<Gift>(`/ideas/${ideaId}/add-to-list`, { list_id: listId });
    },
    onSuccess: (data, variables) => {
      // Invalidate idea inbox to reflect changes
      queryClient.invalidateQueries({ queryKey: ['ideas', 'inbox'] });
      // Invalidate the specific list to show the new item
      queryClient.invalidateQueries({ queryKey: ['lists', variables.listId] });
      // Invalidate all lists to update counts
      queryClient.invalidateQueries({ queryKey: ['lists'], exact: false });
    },
  });
}
