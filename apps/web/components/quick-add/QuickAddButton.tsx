'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@/components/layout/icons';
import { QuickAddModal } from './QuickAddModal';

interface QuickAddButtonProps {
  variant?: 'fab' | 'header';
}

/**
 * Quick Add Button
 *
 * Floating action button (FAB) or header button to trigger Quick Add modal.
 *
 * Variants:
 * - 'fab': Floating action button (fixed bottom-right, circular)
 *   - Mobile: bottom-20 (above nav bar)
 *   - Desktop: bottom-6
 *   - z-40 to stay above content but below modal overlays
 *
 * - 'header': Regular button for header/toolbar
 *   - Text label with icon
 *   - Standard button styling
 *
 * Features:
 * - 44px+ touch targets
 * - Keyboard accessible
 * - ARIA labels
 * - Mobile-first positioning
 */
export function QuickAddButton({ variant = 'fab' }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'fab') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 active:bg-primary-800 transition-colors z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          aria-label="Quick add idea"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
        <QuickAddModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" aria-label="Quick add idea" className="min-w-[44px] px-2">
        <PlusIcon className="w-5 h-5" />
      </Button>
      <QuickAddModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
