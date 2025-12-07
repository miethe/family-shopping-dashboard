/**
 * BulkActionBar Component
 *
 * Fixed bottom bar for bulk gift actions with glass morphism design.
 * Appears when gifts are selected, provides actions for mark purchased, assign, and delete.
 *
 * Features:
 * - Glass panel with backdrop blur
 * - Slide up/down animations
 * - PersonDropdown for assign actions
 * - ConfirmDialog for delete action
 * - Handles partial failures gracefully
 * - Mobile responsive with safe area insets
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PersonDropdown } from '@/components/common/PersonDropdown';
import { Check, User, UserPlus, Trash2, X } from '@/components/ui/icons';
import { giftApi } from '@/lib/api/endpoints';
import type { BulkGiftAction, BulkGiftResult } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface BulkActionBarProps {
  selectedIds: Set<number>;
  onClear: () => void;
  onActionComplete?: () => void;
}

type AssignmentType = 'recipient' | 'purchaser' | null;

/**
 * BulkActionBar Component
 *
 * Bottom action bar for bulk gift operations.
 */
export function BulkActionBar({
  selectedIds,
  onClear,
  onActionComplete,
}: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  const [assignmentType, setAssignmentType] = React.useState<AssignmentType>(null);
  const [selectedPersonId, setSelectedPersonId] = React.useState<number | null>(null);
  const [resultMessage, setResultMessage] = React.useState<{
    type: 'success' | 'error' | 'partial';
    message: string;
  } | null>(null);

  const isVisible = selectedIds.size > 0;
  const giftIds = Array.from(selectedIds);

  // Clear result message after 5 seconds
  React.useEffect(() => {
    if (resultMessage) {
      const timer = setTimeout(() => setResultMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [resultMessage]);

  // Handle bulk action API call
  const performBulkAction = async (
    action: BulkGiftAction['action'],
    personId?: number
  ): Promise<BulkGiftResult> => {
    const data: BulkGiftAction = {
      gift_ids: giftIds,
      action,
      ...(personId && { person_id: personId }),
    };

    return await giftApi.bulkAction(data);
  };

  // Handle action result
  const handleActionResult = (result: BulkGiftResult, actionName: string) => {
    const { success_count, failed_ids, errors } = result;

    if (failed_ids.length === 0) {
      // Complete success
      setResultMessage({
        type: 'success',
        message: `${success_count} ${success_count === 1 ? 'gift' : 'gifts'} ${actionName}`,
      });
    } else if (success_count === 0) {
      // Complete failure
      setResultMessage({
        type: 'error',
        message: `Failed to ${actionName.toLowerCase()}: ${errors[0] || 'Unknown error'}`,
      });
    } else {
      // Partial success
      setResultMessage({
        type: 'partial',
        message: `${success_count} ${actionName}, ${failed_ids.length} failed`,
      });
    }

    // Refresh gifts and clear selection
    if (onActionComplete) {
      onActionComplete();
    }
    onClear();
  };

  // Mark Purchased Action
  const handleMarkPurchased = async () => {
    setIsProcessing(true);
    try {
      const result = await performBulkAction('mark_purchased');
      handleActionResult(result, 'marked as purchased');
    } catch (error) {
      setResultMessage({
        type: 'error',
        message: 'Failed to mark gifts as purchased',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Assign Recipient Action
  const handleAssignRecipient = () => {
    setAssignmentType('recipient');
    setShowAssignDialog(true);
  };

  // Assign Purchaser Action
  const handleAssignPurchaser = () => {
    setAssignmentType('purchaser');
    setShowAssignDialog(true);
  };

  // Delete Action
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      const result = await performBulkAction('delete');
      handleActionResult(result, 'deleted');
    } catch (error) {
      setResultMessage({
        type: 'error',
        message: 'Failed to delete gifts',
      });
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle person selection for assignment
  const handlePersonSelected = async () => {
    if (!selectedPersonId || !assignmentType) return;

    setIsProcessing(true);
    try {
      const action = assignmentType === 'recipient' ? 'assign_recipient' : 'assign_purchaser';
      const result = await performBulkAction(action, selectedPersonId);
      const actionName = assignmentType === 'recipient' ? 'assigned recipient' : 'assigned purchaser';
      handleActionResult(result, actionName);
    } catch (error) {
      setResultMessage({
        type: 'error',
        message: `Failed to assign ${assignmentType}`,
      });
    } finally {
      setIsProcessing(false);
      setShowAssignDialog(false);
      setSelectedPersonId(null);
      setAssignmentType(null);
    }
  };

  if (!isVisible && !resultMessage) return null;

  return (
    <>
      {/* Result Message Toast */}
      {resultMessage && (
        <div
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-[60]',
            'px-6 py-3 rounded-large shadow-diffused',
            'backdrop-blur-md border',
            'animate-in fade-in-0 slide-in-from-top-2',
            'max-w-md mx-auto',
            resultMessage.type === 'success' && 'bg-green-50/90 border-green-200 text-green-900',
            resultMessage.type === 'error' && 'bg-red-50/90 border-red-200 text-red-900',
            resultMessage.type === 'partial' && 'bg-yellow-50/90 border-yellow-200 text-yellow-900'
          )}
        >
          <p className="text-sm font-medium">{resultMessage.message}</p>
        </div>
      )}

      {/* Bulk Action Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'transition-transform duration-300 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div
          className={cn(
            'bg-white/85 backdrop-blur-xl',
            'border-t border-warm-200',
            'shadow-[0_-4px_16px_rgba(0,0,0,0.06)]',
            'pb-[env(safe-area-inset-bottom)]',
            // Desktop: rounded top corners
            'md:rounded-t-[20px]',
            // Mobile: full width, no radius
            'rounded-t-none'
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 h-14 sm:h-16">
              {/* Left: Selection count + Clear */}
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-warm-900">
                  <span className="hidden sm:inline">{selectedIds.size} selected</span>
                  <span className="sm:hidden">{selectedIds.size}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={isProcessing}
                  className="h-9 px-3 rounded-full"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                {/* Mark Purchased */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkPurchased}
                  disabled={isProcessing}
                  className="h-9 px-3 sm:px-4 rounded-full"
                  aria-label="Mark as purchased"
                >
                  <Check className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Purchased</span>
                </Button>

                {/* Assign Recipient */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAssignRecipient}
                  disabled={isProcessing}
                  className="h-9 px-3 sm:px-4 rounded-full"
                  aria-label="Assign recipient"
                >
                  <User className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden md:inline">Recipient</span>
                </Button>

                {/* Assign Purchaser */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAssignPurchaser}
                  disabled={isProcessing}
                  className="h-9 px-3 sm:px-4 rounded-full"
                  aria-label="Assign purchaser"
                >
                  <UserPlus className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden md:inline">Purchaser</span>
                </Button>

                {/* Delete */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="h-9 px-3 sm:px-4 rounded-full"
                  aria-label="Delete gifts"
                >
                  <Trash2 className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Gifts"
        description={`Are you sure you want to delete ${selectedIds.size} ${
          selectedIds.size === 1 ? 'gift' : 'gifts'
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={isProcessing}
      />

      {/* Assign Person Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-bg-base border-warm-200">
          <DialogHeader>
            <DialogTitle className="text-warm-900">
              {assignmentType === 'recipient' ? 'Assign Recipient' : 'Assign Purchaser'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <PersonDropdown
              value={selectedPersonId}
              onChange={(value) => setSelectedPersonId(value as number)}
              label={assignmentType === 'recipient' ? 'Recipient' : 'Purchaser'}
              placeholder={`Select ${assignmentType}...`}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignDialog(false);
                  setSelectedPersonId(null);
                  setAssignmentType(null);
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePersonSelected}
                disabled={!selectedPersonId || isProcessing}
                isLoading={isProcessing}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
