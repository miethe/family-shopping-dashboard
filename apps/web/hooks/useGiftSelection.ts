import { useState, useCallback } from 'react';

/**
 * Hook interface for bulk gift selection
 */
export interface UseGiftSelection {
  /** Set of selected gift IDs */
  selectedIds: Set<number>;
  /** Whether selection mode is active */
  isSelectionMode: boolean;
  /** Toggle selection mode on/off */
  toggleSelectionMode: () => void;
  /** Toggle selection state for a specific gift */
  toggleSelection: (id: number) => void;
  /** Select all gifts from provided array */
  selectAll: (ids: number[]) => void;
  /** Clear all selections and exit selection mode */
  clearSelection: () => void;
  /** Check if a specific gift is selected */
  isSelected: (id: number) => boolean;
}

/**
 * useGiftSelection Hook
 *
 * Manages bulk selection state for gifts page.
 * Provides selection mode toggle, individual/bulk selection,
 * and selection state queries.
 *
 * Features:
 * - Selection mode toggle (activates checkbox UI)
 * - Individual gift selection via checkbox
 * - Select all/clear all functionality
 * - Optimized with Set for O(1) lookups
 * - Clears selections when exiting selection mode
 *
 * @example
 * ```tsx
 * const selection = useGiftSelection();
 *
 * // Enable selection mode
 * <Button onClick={selection.toggleSelectionMode}>
 *   {selection.isSelectionMode ? 'Cancel' : 'Select'}
 * </Button>
 *
 * // Render gift cards
 * {gifts.map(gift => (
 *   <GiftCard
 *     gift={gift}
 *     selectionMode={selection.isSelectionMode}
 *     isSelected={selection.isSelected(gift.id)}
 *     onToggleSelection={() => selection.toggleSelection(gift.id)}
 *   />
 * ))}
 *
 * // Show selection count
 * {selection.selectedIds.size > 0 && (
 *   <div>{selection.selectedIds.size} selected</div>
 * )}
 * ```
 */
export function useGiftSelection(): UseGiftSelection {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  /**
   * Toggle selection mode on/off
   * Clears selections when exiting selection mode
   */
  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      const newMode = !prev;
      // Clear selections when exiting selection mode
      if (!newMode) {
        setSelectedIds(new Set());
      }
      return newMode;
    });
  }, []);

  /**
   * Toggle selection state for a specific gift
   * @param id - Gift ID to toggle
   */
  const toggleSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /**
   * Select all gifts from provided array
   * @param ids - Array of gift IDs to select
   */
  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Check if a specific gift is selected
   * @param id - Gift ID to check
   * @returns true if gift is selected
   */
  const isSelected = useCallback(
    (id: number) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  return {
    selectedIds,
    isSelectionMode,
    toggleSelectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };
}
