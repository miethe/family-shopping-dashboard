'use client';

import { useState } from 'react';
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
import { useCreateFieldOption } from '@/hooks/useFieldOptionsMutation';

interface AddOptionModalProps {
  entity: string;
  fieldName: string;
  onClose: () => void;
}

/**
 * AddOptionModal - Form for creating new field options
 *
 * Requires:
 * - value: immutable key (lowercase, underscores)
 * - display_label: human-readable label
 * - display_order: optional sort order
 */
export function AddOptionModal({
  entity,
  fieldName,
  onClose,
}: AddOptionModalProps) {
  const [value, setValue] = useState('');
  const [displayLabel, setDisplayLabel] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: createOption, isPending, error } = useCreateFieldOption(
    entity,
    fieldName,
    {
      onSuccess: () => {
        onClose();
      },
    }
  );

  // Auto-generate value from display_label
  const handleLabelChange = (newLabel: string) => {
    setDisplayLabel(newLabel);
    // Auto-generate value: lowercase, replace spaces with underscores
    const autoValue = newLabel
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    setValue(autoValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate
    if (!value.trim()) {
      setValidationError('Value is required');
      return;
    }
    if (!displayLabel.trim()) {
      setValidationError('Display label is required');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(value)) {
      setValidationError('Value must be lowercase letters, numbers, and underscores only');
      return;
    }

    createOption({
      entity,
      field_name: fieldName,
      value: value.trim(),
      display_label: displayLabel.trim(),
      display_order: displayOrder,
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Option</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Label */}
          <div className="space-y-2">
            <Label htmlFor="displayLabel">Display Label *</Label>
            <Input
              id="displayLabel"
              value={displayLabel}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g., Sake, Low Priority, Birthday"
              required
              disabled={isPending}
              className="min-h-[44px]"
            />
            <p className="text-xs text-warm-500">
              The label shown to users in dropdowns
            </p>
          </div>

          {/* Value (Key) */}
          <div className="space-y-2">
            <Label htmlFor="value">Value (Key) *</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value.toLowerCase())}
              placeholder="e.g., sake, low, birthday"
              required
              disabled={isPending}
              className="min-h-[44px] font-mono text-sm"
            />
            <p className="text-xs text-warm-500">
              Immutable after creation. Lowercase letters, numbers, underscores only.
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
              disabled={isPending}
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
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error instanceof Error ? error.message : 'Failed to create option'}
            </div>
          )}

          {/* Footer Buttons */}
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
              type="submit"
              disabled={isPending}
              className="min-h-[44px]"
            >
              {isPending ? 'Creating...' : 'Create Option'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
