'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useDeleteFieldOption } from '@/hooks/useFieldOptionsMutation';
import type { FieldOptionDTO } from '@/lib/api/field-options';

interface DeleteConfirmationModalProps {
  option: FieldOptionDTO;
  entity: string;
  fieldName: string;
  onClose: () => void;
}

/**
 * DeleteConfirmationModal - Confirmation dialog for deleting options
 *
 * Shows warning if option is in use (soft-delete only)
 * Allows hard delete if option is unused
 */
export function DeleteConfirmationModal({
  option,
  entity,
  fieldName,
  onClose,
}: DeleteConfirmationModalProps) {
  const inUse = option.usage_count !== undefined && option.usage_count > 0;

  const { mutate: deleteOption, isPending, error } = useDeleteFieldOption(
    option.id,
    {
      onSuccess: () => {
        onClose();
      },
    }
  );

  const handleDelete = () => {
    // Soft-delete if in use, hard-delete if unused
    deleteOption({ hardDelete: !inUse });
  };

  // Don't allow deleting system options
  if (option.is_system) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="lock" className="w-5 h-5 text-warm-500" />
              Cannot Delete System Option
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-warm-700">
              <strong>{option.display_label}</strong> is a system option and cannot be deleted.
            </p>
            <p className="text-sm text-warm-500 mt-2">
              System options are required for the application to function correctly.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={onClose} className="min-h-[44px]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="warning" className="w-5 h-5 text-status-warning-600" />
            Delete Option
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Confirmation Message */}
          <p className="text-warm-700">
            Are you sure you want to delete{' '}
            <strong>{option.display_label}</strong>?
          </p>

          {/* In-Use Warning */}
          {inUse && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    This option is in use
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {option.usage_count} record(s) use this value.
                    It will be <strong>soft-deleted</strong> (hidden from UI but still valid for existing records).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unused Info */}
          {!inUse && (
            <div className="p-4 bg-warm-50 border border-warm-200 rounded-lg">
              <p className="text-sm text-warm-600">
                This option is not in use and will be <strong>permanently deleted</strong>.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-status-error-50 text-status-error-700 rounded-lg text-sm">
              <Icon name="error" className="w-4 h-4 inline mr-2" />
              {error instanceof Error ? error.message : 'Failed to delete option'}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="min-h-[44px]"
          >
            {isPending ? 'Deleting...' : inUse ? 'Soft Delete' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
