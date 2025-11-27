'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/hooks/useComments';
import type { CommentEntityType } from '@/types';

interface CommentFormProps {
  entityType: CommentEntityType;
  entityId: number;
}

const MAX_COMMENT_LENGTH = 500;

export function CommentForm({ entityType, entityId }: CommentFormProps) {
  const [text, setText] = React.useState('');
  const createComment = useCreateComment();

  const remainingChars = MAX_COMMENT_LENGTH - text.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 50 && remainingChars >= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || isOverLimit) {
      return;
    }

    try {
      await createComment.mutateAsync({
        entity_type: entityType,
        entity_id: entityId,
        text: text.trim(),
      });

      // Clear form on success
      setText('');
    } catch (error) {
      // Error handling is managed by React Query
      console.error('Failed to create comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
        className="resize-none"
        disabled={createComment.isPending}
        error={isOverLimit ? `Comment is ${-remainingChars} characters too long` : undefined}
      />

      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            isOverLimit
              ? 'text-red-600 font-medium'
              : isNearLimit
              ? 'text-orange-600'
              : 'text-gray-500'
          }`}
        >
          {remainingChars} characters remaining
        </span>

        <Button
          type="submit"
          disabled={!text.trim() || isOverLimit || createComment.isPending}
          isLoading={createComment.isPending}
        >
          Add Comment
        </Button>
      </div>

      {createComment.isError && (
        <p className="text-sm text-red-600" role="alert">
          Failed to add comment. Please try again.
        </p>
      )}
    </form>
  );
}
