'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { CommentForm } from './CommentForm';
import { CommentCard } from './CommentCard';
import { useComments } from '@/hooks/useComments';
import type { CommentEntityType } from '@/types';

interface CommentThreadProps {
  entityType: CommentEntityType;
  entityId: number;
  currentUserId?: number;
  className?: string;
}

export function CommentThread({
  entityType,
  entityId,
  currentUserId,
  className,
}: CommentThreadProps) {
  const { data: comments, isLoading, isError, error } = useComments(entityType, entityId);

  // Sort comments by timestamp (newest first)
  const sortedComments = React.useMemo(() => {
    if (!comments) return [];
    return [...comments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [comments]);

  return (
    <Card variant="default" padding="default" className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments?.length ?? 0})
        </h3>
      </div>

      {/* Add comment form */}
      <div className="mb-6">
        <CommentForm entityType={entityType} entityId={entityId} />
      </div>

      {/* Comments list */}
      <div className="space-y-2">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6 text-primary-600" />
            <span className="ml-2 text-gray-500">Loading comments...</span>
          </div>
        )}

        {isError && (
          <div className="text-center py-8">
            <p className="text-red-600" role="alert">
              Failed to load comments. Please try again.
            </p>
          </div>
        )}

        {!isLoading && !isError && sortedComments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          sortedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              entityType={entityType}
              entityId={entityId}
            />
          ))}
      </div>
    </Card>
  );
}
