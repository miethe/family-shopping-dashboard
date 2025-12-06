'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { useCreateComment } from '@/hooks/useComments';
import type { CommentEntityType } from '@/types';

interface CommentFormProps {
  entityType: CommentEntityType;
  entityId: number;
}

const MAX_COMMENT_LENGTH = 500;

export function CommentForm({ entityType, entityId }: CommentFormProps) {
  const [text, setText] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
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
        visibility: isPrivate ? 'private' : 'public',
      });

      // Clear form on success
      setText('');
      setIsPrivate(false);
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

      <div className="flex items-center gap-3">
        <Switch
          id="comment-visibility"
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
          disabled={createComment.isPending}
          className="flex-shrink-0"
        />
        <div className="flex items-center gap-1.5 flex-1">
          <Icon name="lock" size="sm" className="text-warm-600" aria-hidden />
          <label
            htmlFor="comment-visibility"
            className="text-sm text-warm-700 cursor-pointer"
          >
            Private (only visible to you)
          </label>
        </div>
      </div>

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
