/**
 * SeparateSharedDialog Component
 *
 * Dialog for choosing between creating separate gifts (one per recipient)
 * or a shared gift (one gift for all recipients) when multiple recipients
 * are selected in the GiftForm.
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Users } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export interface SeparateSharedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  recipientNames: string[];
  onSeparate: () => void;
  onShared: () => void;
  isLoading?: boolean;
}

type GiftOption = 'separate' | 'shared';

export function SeparateSharedDialog({
  isOpen,
  onClose,
  recipientCount,
  recipientNames,
  onSeparate,
  onShared,
  isLoading = false,
}: SeparateSharedDialogProps) {
  const [selected, setSelected] = React.useState<GiftOption>('separate');

  // Reset selection when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSelected('separate');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selected === 'separate') {
      onSeparate();
    } else {
      onShared();
    }
  };

  const displayNames = recipientNames.slice(0, 3).join(', ');
  const moreCount = recipientCount - 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Multiple Recipients</DialogTitle>
          <DialogDescription>
            You&apos;ve selected {recipientCount} recipients:{' '}
            <span className="font-medium text-warm-900">
              {displayNames}
              {moreCount > 0 && ` and ${moreCount} more`}
            </span>
            . How should we handle this?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Separate Gifts Option */}
          <button
            type="button"
            onClick={() => setSelected('separate')}
            disabled={isLoading}
            className={cn(
              'w-full p-4 rounded-large border-2 transition-all duration-200',
              'flex items-start gap-4 text-left',
              'min-h-[44px]',
              'hover:bg-warm-50',
              selected === 'separate'
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light bg-white',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Create separate gifts"
          >
            {/* Radio Circle */}
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  selected === 'separate'
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-warm-400 bg-white'
                )}
              >
                {selected === 'separate' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className={cn(
                'w-10 h-10 rounded-medium flex items-center justify-center',
                selected === 'separate' ? 'bg-primary-100' : 'bg-warm-100'
              )}>
                <Gift className={cn(
                  'w-5 h-5',
                  selected === 'separate' ? 'text-primary-600' : 'text-warm-600'
                )} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-warm-900 mb-1">
                Separate Gifts
              </div>
              <div className="text-sm text-warm-700">
                Creates {recipientCount} individual gifts, one for each recipient. Each gift can be tracked separately.
              </div>
            </div>
          </button>

          {/* Shared Gift Option */}
          <button
            type="button"
            onClick={() => setSelected('shared')}
            disabled={isLoading}
            className={cn(
              'w-full p-4 rounded-large border-2 transition-all duration-200',
              'flex items-start gap-4 text-left',
              'min-h-[44px]',
              'hover:bg-warm-50',
              selected === 'shared'
                ? 'border-primary-500 bg-primary-50'
                : 'border-border-light bg-white',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Create shared gift"
          >
            {/* Radio Circle */}
            <div className="flex-shrink-0 mt-0.5">
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  selected === 'shared'
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-warm-400 bg-white'
                )}
              >
                {selected === 'shared' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className={cn(
                'w-10 h-10 rounded-medium flex items-center justify-center',
                selected === 'shared' ? 'bg-primary-100' : 'bg-warm-100'
              )}>
                <Users className={cn(
                  'w-5 h-5',
                  selected === 'shared' ? 'text-primary-600' : 'text-warm-600'
                )} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-warm-900 mb-1">
                Shared Gift
              </div>
              <div className="text-sm text-warm-700">
                Creates one gift shared between all {recipientCount} recipients. Good for group gifts or joint presents.
              </div>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading
              ? 'Creating...'
              : selected === 'separate'
              ? `Create ${recipientCount} Gifts`
              : 'Create Shared Gift'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
