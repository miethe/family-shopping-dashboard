'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useDeleteComment } from '@/hooks/useComments';
import { formatRelativeTime } from '@/lib/utils';
import type { Comment, CommentEntityType } from '@/types';

interface CommentCardProps {
  comment: Comment;
  currentUserId?: number;
  entityType: CommentEntityType;
  entityId: number;
}

export function CommentCard({ comment, currentUserId, entityType, entityId }: CommentCardProps) {
  const deleteComment = useDeleteComment(entityType, entityId);
  const isOwnComment = currentUserId === comment.user_id;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment.mutateAsync(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Avatar */}
      <Avatar size="default">
        <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Name + Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-gray-900 truncate">{comment.user_name}</span>
            <span className="text-sm text-gray-500 flex-shrink-0">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          {/* Delete button (only for own comments) */}
          {isOwnComment && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              aria-label="Delete comment"
            >
              {deleteComment.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>

        {/* Comment text */}
        <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.text}</p>

        {/* Error message */}
        {deleteComment.isError && (
          <p className="text-sm text-red-600 mt-2" role="alert">
            Failed to delete comment. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
