/**
 * PurchaserAssignDialog Component
 *
 * Dialog that appears when a gift status changes to a "purchasing" status
 * (buying, ordered, purchased). Allows assigning a person as the purchaser
 * of the gift, or skipping the assignment.
 *
 * Design: Soft Modernity - Apple-inspired warmth
 * Animation: Slide up from bottom
 * Mobile-first with 44px touch targets
 */

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PersonDropdown } from '@/components/common/PersonDropdown';
import { cn } from '@/lib/utils';

export interface PurchaserAssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (purchaserId: number | null) => void;
  isLoading?: boolean;
  giftName?: string;
}

/**
 * PurchaserAssignDialog
 *
 * Modal dialog for assigning a purchaser when gift status changes to a purchasing state.
 * Provides options to assign a person or skip the assignment.
 */
export function PurchaserAssignDialog({
  isOpen,
  onClose,
  onAssign,
  isLoading = false,
  giftName,
}: PurchaserAssignDialogProps) {
  const [selectedPurchaserId, setSelectedPurchaserId] = React.useState<number | null>(null);

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedPurchaserId(null);
    }
  }, [isOpen]);

  const handleSkip = () => {
    onAssign(null);
  };

  const handleAssign = () => {
    onAssign(selectedPurchaserId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'max-w-md',
          // Slide up animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4'
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-warm-900">
            Who&apos;s purchasing this gift?
          </DialogTitle>
          <DialogDescription className="text-base text-warm-600">
            {giftName ? (
              <>
                Assign someone to track who&apos;s buying <span className="font-semibold text-warm-800">{giftName}</span>
              </>
            ) : (
              'Assign someone to track who is buying this gift'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <PersonDropdown
            value={selectedPurchaserId}
            onChange={(value) => {
              // PersonDropdown returns number | number[] | null
              // We only need single select, so cast to number | null
              if (typeof value === 'number') {
                setSelectedPurchaserId(value);
              } else if (value === null) {
                setSelectedPurchaserId(null);
              }
            }}
            label="Purchaser"
            placeholder="Select person..."
            allowNew={true}
            multiSelect={false}
            variant="default"
          />
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleAssign}
            disabled={!selectedPurchaserId || isLoading}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
