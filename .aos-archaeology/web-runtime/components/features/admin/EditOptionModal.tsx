'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icon } from '@/components/ui/icon';
import { useFieldOption } from '@/hooks/useFieldOptions';
import { useUpdateFieldOption } from '@/hooks/useFieldOptionsMutation';

interface EditOptionModalProps {
  optionId: number;
  entity: string;
  fieldName: string;
  onClose: () => void;
}

/**
 * EditOptionModal - Form for editing existing field options
 *
 * Can edit:
 * - display_label: human-readable label
 * - display_order: sort order
 *
 * Cannot edit:
 * - value: immutable after creation
 * - is_system: cannot change system status
 */
export function EditOptionModal({
  optionId,
  entity,
  fieldName,
  onClose,
}: EditOptionModalProps) {
  const { data: option, isLoading: loadingOption, error: fetchError } = useFieldOption(optionId);

  const [displayLabel, setDisplayLabel] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: updateOption, isPending: updating, error: updateError } = useUpdateFieldOption(
    optionId,
    {
      onSuccess: () => {
        onClose();
      },
    }
  );

  // Populate form when option data loads
  useEffect(() => {
    if (option) {
      setDisplayLabel(option.display_label);
      setDisplayOrder(option.display_order);
    }
  }, [option]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!displayLabel.trim()) {
      setValidationError('Display label is required');
      return;
    }

    updateOption({
      display_label: displayLabel.trim(),
      display_order: displayOrder,
    });
  };

  // Loading state while fetching option
  if (loadingOption) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <Icon name="progress_activity" className="w-6 h-6 animate-spin text-warm-500" />
            <span className="ml-2 text-warm-500">Loading option...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state if fetch failed
  if (fetchError) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            <Icon name="error" className="w-5 h-5 inline mr-2" />
            Failed to load option: {fetchError instanceof Error ? fetchError.message : 'Unknown error'}
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

  // System option - cannot edit
  if (option?.is_system) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="lock" className="w-5 h-5 text-warm-500" />
              Cannot Edit System Option
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-warm-700">
              <strong>{option.display_label}</strong> is a system option and cannot be edited.
            </p>
            <p className="text-sm text-warm-500 mt-2">
              System options are managed by the application and their values are fixed.
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
          <DialogTitle>Edit Option</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Value (Read-only) */}
          <div className="space-y-2">
            <Label>Value (Key)</Label>
            <div className="px-3 py-2 bg-warm-100 rounded-lg text-warm-600 text-sm font-mono">
              {option?.value}
            </div>
            <p className="text-xs text-warm-500">
              Value is immutable after creation
            </p>
          </div>

          {/* Display Label */}
          <div className="space-y-2">
            <Label htmlFor="displayLabel">Display Label *</Label>
            <Input
              id="displayLabel"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              required
              disabled={updating}
              className="min-h-[44px]"
            />
            <p className="text-xs text-warm-500">
              The label shown to users in dropdowns
            </p>
          </div>

          {/* Display Order */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              disabled={updating}
              className="min-h-[44px]"
            />
            <p className="text-xs text-warm-500">
              Lower numbers appear first in lists
            </p>
          </div>

          {/* Error Messages */}
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {validationError}
            </div>
          )}
          {updateError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {updateError instanceof Error ? updateError.message : 'Failed to update option'}
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updating}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updating}
              className="min-h-[44px]"
            >
              {updating ? 'Updating...' : 'Update Option'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
