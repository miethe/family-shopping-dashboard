/**
 * GroupSelectAllButton Component
 *
 * Status-group specific "Select All" button that appears in grouped section headers.
 * Only visible when selection mode is active. Shows count of items in group and
 * allows selecting/deselecting all items within a specific status group.
 */

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GroupSelectAllButtonProps {
  /** The status label to display (e.g., "Ideas", "Purchased") */
  statusLabel: string;
  /** IDs of gifts in this status group */
  groupGiftIds: number[];
  /** Currently selected gift IDs (to check what's selected in this group) */
  selectedIds: Set<number>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Called with array of gift IDs to select */
  onSelectGroup: (ids: number[]) => void;
  /** Called with array of gift IDs to deselect */
  onDeselectGroup: (ids: number[]) => void;
}

export function GroupSelectAllButton({
  statusLabel,
  groupGiftIds,
  selectedIds,
  isSelectionMode,
  onSelectGroup,
  onDeselectGroup,
}: GroupSelectAllButtonProps) {
  // Don't render if selection mode is off or group is empty
  if (!isSelectionMode || groupGiftIds.length === 0) return null;

  // Count how many gifts in this group are selected
  const selectedInGroup = groupGiftIds.filter((id) => selectedIds.has(id)).length;
  const isAllGroupSelected = selectedInGroup === groupGiftIds.length;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent collapsible toggle
    if (isAllGroupSelected) {
      onDeselectGroup(groupGiftIds);
    } else {
      onSelectGroup(groupGiftIds);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'min-h-[44px] px-3',
        'text-xs font-medium text-warm-600',
        'hover:bg-warm-200/50 hover:text-warm-900',
        'rounded-medium',
        'transition-colors duration-150'
      )}
    >
      {isAllGroupSelected
        ? `Deselect ${statusLabel}`
        : `Select All ${statusLabel} (${groupGiftIds.length})`}
    </Button>
  );
}
