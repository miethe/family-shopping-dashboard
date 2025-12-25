/**
 * SelectAllButton Component
 *
 * Page-level "Select All" button that appears below the GiftToolbar when in selection mode.
 * Toggles between "Select All (N)" and "Deselect All" based on current selection state.
 *
 * Features:
 * - Conditional rendering based on selection mode
 * - Dynamic button text based on selection state
 * - Minimum 44px touch target for mobile
 * - Outline variant for subtle appearance
 *
 * Design: Soft Modernity (Apple-inspired warmth)
 */

'use client';

import { Button } from '@/components/ui/button';

export interface SelectAllButtonProps {
  /** Whether selection mode is active (controls visibility) */
  isSelectionMode: boolean;
  /** Number of currently selected gifts */
  selectedCount: number;
  /** Total number of visible gifts */
  totalCount: number;
  /** Called when "Select All" is clicked */
  onSelectAll: () => void;
  /** Called when "Deselect All" is clicked */
  onDeselectAll: () => void;
}

/**
 * SelectAllButton Component
 *
 * Renders a button to select/deselect all gifts when in selection mode.
 */
export function SelectAllButton({
  isSelectionMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
}: SelectAllButtonProps) {
  // Hide if not in selection mode or no gifts to select
  if (!isSelectionMode || totalCount === 0) return null;

  // Determine if all gifts are selected
  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <Button
      variant="outline"
      onClick={isAllSelected ? onDeselectAll : onSelectAll}
      className="min-h-[44px]"
    >
      {isAllSelected ? 'Deselect All' : `Select All (${totalCount})`}
    </Button>
  );
}
