/**
 * Comments Hook
 *
 * React Query hooks for Comment entity CRUD operations with cache management.
 * Provides polymorphic comment functionality for lists, occasions, and list items.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/lib/api/endpoints';
import type { Comment, CommentCreate, CommentUpdate, CommentEntityType } from '@/types';

/**
 * Fetch comments for a specific entity
 * @param entityType - Type of entity (list, occasion, list_item)
 * @param entityId - ID of the entity
 */
export function useComments(entityType: CommentEntityType, entityId: number) {
  return useQuery({
    queryKey: ['comments', entityType, entityId],
    queryFn: () => commentApi.list({ entity_type: entityType, entity_id: entityId }),
    enabled: !!entityType && !!entityId,
  });
}

/**
 * Create new comment
 * Invalidates comments cache on success
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommentCreate) => commentApi.create(data),
    onSuccess: (newComment) => {
      // Invalidate the specific entity's comments
      queryClient.invalidateQueries({
        queryKey: ['comments', newComment.entity_type, newComment.entity_id],
      });
    },
  });
}

/**
 * Update comment
 * Invalidates comments cache on success
 * @param entityType - Type of entity for cache invalidation
 * @param entityId - ID of entity for cache invalidation
 */
export function useUpdateComment(entityType: CommentEntityType, entityId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: CommentUpdate }) =>
      commentApi.update(commentId, data),
    onSuccess: () => {
      // Invalidate the specific entity's comments
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
    },
  });
}

/**
 * Delete comment
 * Invalidates comments cache on success
 * @param entityType - Type of entity for cache invalidation
 * @param entityId - ID of entity for cache invalidation
 */
export function useDeleteComment(entityType: CommentEntityType, entityId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () => {
      // Invalidate the specific entity's comments
      queryClient.invalidateQueries({
        queryKey: ['comments', entityType, entityId],
      });
    },
  });
}
