'use client';

import * as React from 'react';
import { CommentThread } from './CommentThread';
import { useAuth } from '@/hooks/useAuth';
import type { CommentEntityType } from '@/types';

interface CommentsTabProps {
  entityType: CommentEntityType;
  entityId: number | undefined;
  className?: string;
}

/**
 * Wrapper component for embedding CommentThread in modal tabs.
 * Handles auth context and guards against missing entity ID.
 */
export function CommentsTab({ entityType, entityId, className }: CommentsTabProps) {
  const { user } = useAuth();

  // Don't render if no entity ID (e.g., modal opened without selecting an entity)
  if (!entityId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select an item to view comments.
      </div>
    );
  }

  return (
    <CommentThread
      entityType={entityType}
      entityId={entityId}
      currentUserId={user?.id}
      className={className}
    />
  );
}
