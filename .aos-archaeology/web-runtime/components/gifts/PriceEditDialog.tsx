/**
 * Price Edit Dialog Component
 *
 * Compact dialog for inline price editing with validation.
 * Supports decimal prices, currency formatting, and null price state.
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateGift } from '@/hooks/useGifts';
import { useToast } from '@/components/ui/use-toast';

export interface PriceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftId: number;
  currentPrice: number | null;
  onSave?: (price: number | null) => void;
}

/**
 * Validates price input string
 * @param price - Price string to validate
 * @returns Validation result with error message if invalid
 */
const validatePrice = (price: string): { valid: boolean; error?: string } => {
  if (!price || price.trim() === '') return { valid: true };

  // Strip $ prefix if present
  const cleanPrice = price.replace(/^\$/, '').trim();

  // Check decimal format (max 2 decimal places)
  const regex = /^\d+(\.\d{0,2})?$/;
  if (!regex.test(cleanPrice)) {
    return { valid: false, error: 'Price must be a valid decimal (e.g., 49.99)' };
  }

  const numPrice = parseFloat(cleanPrice);

  if (numPrice < 0) {
    return { valid: false, error: 'Price must be non-negative' };
  }

  if (numPrice > 10000) {
    return { valid: false, error: 'Price must be less than $10,000' };
  }

  return { valid: true };
};

export function PriceEditDialog({
  open,
  onOpenChange,
  giftId,
  currentPrice,
  onSave,
}: PriceEditDialogProps) {
  const [priceInput, setPriceInput] = useState(currentPrice?.toString() || '');
  const [noPrice, setNoPrice] = useState(!currentPrice);
  const [error, setError] = useState<string | null>(null);

  const { mutate: updateGift, isPending } = useUpdateGift(giftId);
  const { toast } = useToast();

  // Reset state when dialog opens/closes or currentPrice changes
  useEffect(() => {
    if (open) {
      setPriceInput(currentPrice?.toString() || '');
      setNoPrice(!currentPrice);
      setError(null);
    }
  }, [open, currentPrice]);

  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPriceInput(value);

    // Clear "no price" if user starts typing
    if (value.trim()) {
      setNoPrice(false);
    }

    // Validate on change
    const validation = validatePrice(value);
    setError(validation.valid ? null : validation.error || null);
  };

  // Handle "no price" checkbox toggle
  const handleNoPriceToggle = (checked: boolean) => {
    setNoPrice(checked);
    if (checked) {
      setPriceInput('');
      setError(null);
    }
  };

  // Handle save
  const handleSave = () => {
    // If "no price" is checked, save null
    if (noPrice) {
      updateGift(
        { price: null },
        {
          onSuccess: () => {
            toast({
              title: 'Price updated',
              description: 'Price has been cleared.',
              variant: 'success',
            });
            onSave?.(null);
            onOpenChange(false);
          },
          onError: (err: any) => {
            toast({
              title: 'Failed to update price',
              description: err.message || 'An error occurred while updating the price.',
              variant: 'error',
            });
          },
        }
      );
      return;
    }

    // Validate price
    const validation = validatePrice(priceInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid price');
      return;
    }

    // Parse and save price
    const cleanPrice = priceInput.replace(/^\$/, '').trim();
    const numPrice = cleanPrice ? parseFloat(cleanPrice) : null;

    updateGift(
      { price: numPrice },
      {
        onSuccess: () => {
          toast({
            title: 'Price updated',
            description: numPrice ? `Price set to $${numPrice.toFixed(2)}` : 'Price has been cleared.',
            variant: 'success',
          });
          onSave?.(numPrice);
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast({
            title: 'Failed to update price',
            description: err.message || 'An error occurred while updating the price.',
            variant: 'error',
          });
        },
      }
    );
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Disable save if validation fails or if no change
  const isSaveDisabled =
    isPending ||
    !!error ||
    (!noPrice && !priceInput.trim()) ||
    (noPrice && !currentPrice) || // Already no price
    (!noPrice && currentPrice?.toString() === priceInput.replace(/^\$/, '').trim()); // No change

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Edit Price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Input */}
          <div>
            <Input
              label="Price"
              type="text"
              inputMode="decimal"
              placeholder="49.99"
              value={priceInput}
              onChange={handlePriceChange}
              disabled={noPrice || isPending}
              error={error || undefined}
              className="text-right"
            />
            <p className="mt-1.5 text-xs text-warm-600">
              Optional $ prefix (e.g., $49.99)
            </p>
          </div>

          {/* No Price Checkbox */}
          <Checkbox
            id="no-price"
            checked={noPrice}
            onChange={(e) => handleNoPriceToggle(e.target.checked)}
            label="No price"
            helperText="Clear the price for this gift"
            disabled={isPending}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            isLoading={isPending}
            disabled={isSaveDisabled}
            className="flex-1"
          >
            {isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
