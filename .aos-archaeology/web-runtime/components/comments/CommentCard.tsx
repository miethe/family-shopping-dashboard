'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, getInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { useDeleteComment, useUpdateComment } from '@/hooks/useComments';
import { formatRelativeTime } from '@/lib/utils';
import { useConfirmDialog } from '@/components/ui';
import type { Comment, CommentEntityType, CommentVisibility } from '@/types';

interface CommentCardProps {
  comment: Comment;
  currentUserId?: number;
  entityType: CommentEntityType;
  entityId: number;
}

const MAX_COMMENT_LENGTH = 500;

export function CommentCard({ comment, currentUserId, entityType, entityId }: CommentCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(comment.text);
  const [editVisibility, setEditVisibility] = React.useState<CommentVisibility>(comment.visibility);

  const deleteComment = useDeleteComment(entityType, entityId);
  const updateComment = useUpdateComment(entityType, entityId);
  const { confirm, dialog } = useConfirmDialog();

  const canEdit = comment.can_edit;
  const isEdited = new Date(comment.updated_at) > new Date(comment.created_at);
  const isPrivate = comment.visibility === 'private';

  const remainingChars = MAX_COMMENT_LENGTH - editText.length;
  const isOverLimit = remainingChars < 0;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Comment?',
      description: 'Are you sure you want to delete this comment? This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete',
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteComment.mutateAsync(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleEdit = () => {
    setEditText(comment.text);
    setEditVisibility(comment.visibility);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editText.trim() || isOverLimit) {
      return;
    }

    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        data: {
          text: editText.trim(),
          visibility: editVisibility,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setEditVisibility(comment.visibility);
    setIsEditing(false);
  };

  return (
    <>
      {dialog}
      <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        {/* Avatar */}
        <Avatar size="default">
          <AvatarFallback>{getInitials(comment.user_name)}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
        {/* Header: Name + Timestamp + Badges */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="font-medium text-gray-900 truncate">{comment.user_name}</span>
            <span className="text-sm text-gray-500 flex-shrink-0">
              {formatRelativeTime(comment.created_at)}
              {isEdited && <span className="ml-1">(edited)</span>}
            </span>
            {isPrivate && (
              <Badge variant="default" size="sm" className="flex-shrink-0">
                <Icon name="lock" size="xs" aria-hidden />
                Private
              </Badge>
            )}
          </div>

          {/* Action buttons (only for editable comments) */}
          {canEdit && !isEditing && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 px-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Edit comment"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteComment.isPending}
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Delete comment"
              >
                {deleteComment.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        {/* Comment text or edit form */}
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={updateComment.isPending}
              error={isOverLimit ? `Comment is ${-remainingChars} characters too long` : undefined}
            />

            <div className="flex items-center gap-3">
              <Switch
                id={`edit-visibility-${comment.id}`}
                checked={editVisibility === 'private'}
                onCheckedChange={(checked) => setEditVisibility(checked ? 'private' : 'public')}
                disabled={updateComment.isPending}
                className="flex-shrink-0"
              />
              <div className="flex items-center gap-1.5 flex-1">
                <Icon name="lock" size="sm" className="text-warm-600" aria-hidden />
                <label
                  htmlFor={`edit-visibility-${comment.id}`}
                  className="text-sm text-warm-700 cursor-pointer"
                >
                  Private (only visible to you)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  isOverLimit ? 'text-red-600 font-medium' : 'text-gray-500'
                }`}
              >
                {remainingChars} characters remaining
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={updateComment.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editText.trim() || isOverLimit || updateComment.isPending}
                  isLoading={updateComment.isPending}
                >
                  Save
                </Button>
              </div>
            </div>

            {updateComment.isError && (
              <p className="text-sm text-red-600" role="alert">
                Failed to update comment. Please try again.
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap break-words">{comment.text}</p>
        )}

        {/* Error message for delete */}
        {deleteComment.isError && (
          <p className="text-sm text-red-600 mt-2" role="alert">
            Failed to delete comment. Please try again.
          </p>
        )}
        </div>
      </div>
    </>
  );
}
