---
title: "Implementation Plan: Gift Select Mode Enhancements v1"
description: "Phased implementation of enhanced gift selection with Select All buttons, grouped status selection, checkbox fixes, and bulk action bar integration"
audience: [ai-agents, developers]
tags: [implementation, planning, gifts, frontend, features, bulk-actions]
created: 2025-12-25
updated: 2025-12-25
category: "product-planning"
status: ready
related:
  - /docs/project_plans/PRDs/features/gifts-action-bar-v1.md
---

# Implementation Plan: Gift Select Mode Enhancements v1

**Plan ID**: `IMPL-2025-12-25-GIFT-SELECT-ENHANCEMENTS-V1`
**Date**: 2025-12-25
**Author**: Implementation Planning Orchestrator (Haiku)
**Related Documents**:
- **GiftsPage**: `apps/web/app/gifts/page.tsx`
- **Selection Hook**: `apps/web/hooks/useGiftSelection.ts`
- **GiftCard**: `apps/web/components/gifts/GiftCard.tsx`
- **GiftGroupedView**: `apps/web/components/gifts/GiftGroupedView.tsx`
- **BulkActionBar**: `apps/web/components/gifts/BulkActionBar.tsx`
- **GiftToolbar**: `apps/web/components/gifts/GiftToolbar.tsx`
- **Web Architecture**: `apps/web/CLAUDE.md`

**Complexity**: Medium (M)
**Total Estimated Effort**: 18 story points
**Target Timeline**: 3-4 business days

---

## Executive Summary

This implementation plan delivers four focused enhancements to the gift selection mode on the `/gifts` page: fixing checkbox visibility in grouped views, adding "Select All" buttons at multiple levels, and integrating the fully-built BulkActionBar component with bulk actions. These improvements enable rapid multi-gift operations and complete the selection mode experience that is currently half-implemented.

**Track**: Standard Track (Medium complexity, Haiku + Sonnet agents)

**Key Milestones**:
1. **Phase 1 (Day 1)**: Fix GiftGroupedView checkbox passing and BulkActionBar integration
2. **Phase 2 (Day 2)**: Add "Select All" UI components at page and grouped section levels
3. **Phase 3 (Days 3-4)**: Testing, polish, accessibility validation, documentation

**Success Criteria**:
- Checkboxes visible in all gift display modes (grid + grouped)
- "Select All" buttons functional at page and status-group levels
- BulkActionBar renders and handles all existing bulk actions
- Touch targets ≥44px on mobile
- <300ms interaction latency
- Zero new API endpoints needed (uses existing bulk action endpoint)
- 100% of selection functionality properly integrated
- WCAG 2.1 AA accessibility compliance

---

## Implementation Strategy

### Architecture Sequence

Following layered architecture, work flows bottom-up from data to presentation:

```
1. Selection State    (Hook)         → Already complete (useGiftSelection.ts)
2. Data Layer         (API)          → No changes needed (bulk action endpoint exists)
3. Component Layer    (GiftCard)     → Fix prop passing
4. View Layer         (GiftGroupedView) → Pass selection props through
5. Container Layer    (GiftsPage)    → Wire selection to components
6. UI Layer           (SelectAll buttons) → Add new lightweight components
7. Integration Layer  (BulkActionBar)    → Import and render
8. Testing & Polish   (Phase 3)      → Comprehensive QA
```

### Parallel Work Opportunities

**High Priority Parallelization**:
- Phase 2 UI components (SelectAll buttons) can start during Phase 1
- Testing can begin Day 2 as features are wired
- Component polishing (spacing, animations) can happen during testing phase

**Recommended Timeline**:
- **Day 1 (Morning)**: Phase 1 implementation (checkbox fixes + BulkActionBar integration)
- **Day 1 (Afternoon)**: Phase 2 implementation (SelectAll components) starts in parallel
- **Days 2-3**: Phase 2 completion + testing
- **Day 4**: Final polish, accessibility audit, documentation

**Critical Path**: Phase 1 must complete before Phase 2 integration testing (BulkActionBar needs proper selection flow).

---

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **State Management** | React hooks (useState) + Set data structure | O(1) lookups, already implemented |
| **UI Components** | Radix Collapsible, Button, Checkbox | Existing design system |
| **Styling** | Tailwind CSS | Mobile-first responsive |
| **API** | React Query mutations | Existing bulk action endpoint |
| **Type Safety** | TypeScript | Strict typing for selection props |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| GiftGroupedView re-render performance | Low | Medium | Memoize status section components if needed |
| Checkbox state desync | Very Low | High | useGiftSelection hook provides single source of truth |
| BulkActionBar mutation failures | Low | Medium | Existing error handling in BulkActionBar; surface to user |
| Missing status group IDs | Low | Medium | Verify GiftGroupedView grouping logic before Phase 2 |

---

## Dependencies & Integration Points

### Frontend Dependencies

| Component | Purpose | Status |
|-----------|---------|--------|
| `useGiftSelection()` | Core selection state management | Complete, no changes needed |
| `GiftCard` component | Checkbox rendering on individual gifts | Fix prop passing (Phase 1) |
| `GiftGroupedView` component | Group layout + status sections | Pass through selection props (Phase 1) |
| `BulkActionBar` component | Bulk actions UI + mutations | Integrate into page (Phase 1) |
| `GiftsPage` | Container/orchestration | Wire everything together |

### React Query Integration

- **No new queries needed**: Existing useGifts() hook provides gift data
- **No cache invalidation needed**: BulkActionBar handles via existing mutations
- **Selection state**: Separate from React Query (client-side Set, not cached)

---

## Quality Gates

### Phase 1 Quality Gates (GiftCard + GiftGroupedView + BulkActionBar)

- [ ] GiftGroupedView receives and passes `selectionMode`, `isSelected`, `onToggleSelection` props to GiftCard
- [ ] Checkboxes appear in both grid and grouped view modes
- [ ] BulkActionBar imports correctly and renders when selectedIds.size > 0
- [ ] Selection state updates properly when checkboxes clicked
- [ ] No TypeScript errors
- [ ] Code review by frontend specialist

### Phase 2 Quality Gates (SelectAll Buttons)

- [ ] "Select All (N)" button appears below GiftToolbar only in selection mode
- [ ] "Select All {STATUS}" buttons appear in each grouped status header
- [ ] Buttons call correct `selectAll()` with proper IDs
- [ ] Toggle state (all selected → "Deselect All") works correctly
- [ ] Touch targets ≥44px on mobile
- [ ] Proper vertical spacing/margins
- [ ] No layout shift when buttons appear/disappear

### Phase 3 Quality Gates (Testing & Polish)

- [ ] Unit tests for SelectAll button logic (render conditions, click handlers)
- [ ] Integration tests for full selection flow (select one → select all → bulk action)
- [ ] E2E test for gift deletion workflow via bulk selection
- [ ] Mobile viewport testing (touch targets, safe areas, responsive layout)
- [ ] Accessibility audit (WCAG 2.1 AA): keyboard navigation, ARIA labels
- [ ] Performance: <300ms latency for select/deselect operations
- [ ] No console errors or warnings
- [ ] Visual polish: consistent spacing, button states, animations

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Feature Completeness** | 100% | All 4 enhancements implemented and tested |
| **Touch Target Size** | ≥44px | All interactive elements mobile-compliant |
| **Interaction Latency** | <300ms | Select/deselect operations measure via DevTools |
| **Test Coverage** | >80% | Vitest unit + integration tests |
| **Accessibility** | WCAG 2.1 AA | axe-core audit, manual keyboard testing |
| **Code Review** | Approved | ai-artifacts-engineer or ui-engineer-enhanced sign-off |
| **Zero Regressions** | 100% | Existing gift list, filter, sort features still work |

---

## File Structure & Changes

### Files to Modify (Existing)

| File | Changes | Phase | Notes |
|------|---------|-------|-------|
| `apps/web/app/gifts/page.tsx` | Import + render BulkActionBar; pass selection props to GiftGroupedView | 1, 2 | Main integration point |
| `apps/web/components/gifts/GiftGroupedView.tsx` | Accept selection props; pass through to GiftCard in render | 1 | Critical fix for grouped view checkboxes |
| `apps/web/components/gifts/GiftCard.tsx` | Already has checkbox logic; no changes needed | - | Verify prop handling works |
| `apps/web/components/gifts/GiftToolbar.tsx` | Add "Select All" button below (conditional rendering) | 2 | New UI element |

### Files to Create (New)

| File | Purpose | Phase | Type |
|------|---------|-------|------|
| `apps/web/components/gifts/SelectAllButton.tsx` | Reusable "Select All / Deselect All" button component | 2 | Component |
| `apps/web/components/gifts/GroupSelectAllButton.tsx` | Status-group specific "Select All {STATUS}" button | 2 | Component |

---

## Implementation Checklist

### Phase 1: Fix Checkboxes + Integrate BulkActionBar (Day 1)

**ui-engineer-enhanced** (Sonnet):

- [ ] **Task 1.1**: Modify GiftGroupedView to accept selection props
  - Add props: `selectionMode: boolean`, `isSelected: (id: number) => boolean`, `onToggleSelection: (id: number) => void`
  - Pass through to GiftCard in status section render
  - File: `apps/web/components/gifts/GiftGroupedView.tsx`

- [ ] **Task 1.2**: Verify GiftCard checkbox logic and prop handling
  - Ensure props match what hook expects
  - Test in both grid and grouped contexts
  - File: `apps/web/components/gifts/GiftCard.tsx`

- [ ] **Task 1.3**: Import BulkActionBar into GiftsPage
  - Add import statement
  - Render at bottom when selectedIds.size > 0
  - Pass props: `selectedIds`, `onClear`, `onActionComplete`
  - File: `apps/web/app/gifts/page.tsx`

- [ ] **Task 1.4**: Wire GiftsPage selection props to GiftGroupedView
  - Pass selection mode from hook to grouped view
  - Ensure state flows properly
  - Test selection updates propagate

### Phase 2: Add SelectAll Buttons (Day 2)

**ui-engineer-enhanced** (Sonnet):

- [ ] **Task 2.1**: Create SelectAllButton component
  - Receive: `isSelectionMode`, `selectedCount`, `totalCount`, `onSelectAll`, `onDeselectAll`
  - Toggle behavior (show "Select All N" if count < total, else "Deselect All")
  - Styling: button variant, proper spacing
  - File: `apps/web/components/gifts/SelectAllButton.tsx`

- [ ] **Task 2.2**: Create GroupSelectAllButton component
  - Receive: `status`, `selectedCount`, `totalCount`, `onSelectAll`, `onDeselectAll`, `isSelectionMode`
  - Integrated in collapsible headers (via GiftGroupedView)
  - Only visible in selection mode
  - File: `apps/web/components/gifts/GroupSelectAllButton.tsx`

- [ ] **Task 2.3**: Integrate SelectAllButton into GiftsPage
  - Render below GiftToolbar, above gift content
  - Only visible when isSelectionMode === true
  - Call selectAll(allGiftIds) with proper IDs
  - Add vertical margin for spacing
  - File: `apps/web/app/gifts/page.tsx`

- [ ] **Task 2.4**: Modify GiftGroupedView to include GroupSelectAllButton
  - Pass button into collapsible header
  - Status-specific selection (only select gifts with that status)
  - Conditional rendering based on selectionMode
  - File: `apps/web/components/gifts/GiftGroupedView.tsx`

- [ ] **Task 2.5**: Wire selectAll() calls with correct gift IDs
  - For page-level: use all visible gift IDs (based on current filters/search)
  - For status-group: use IDs matching that status only
  - Account for filtering/search results

### Phase 3: Testing & Polish (Days 3-4)

**ui-engineer-enhanced** (Sonnet) + **documentation-writer** (Haiku):

- [ ] **Task 3.1**: Unit tests for SelectAll components
  - Test render conditions (visible only in selection mode)
  - Test click handlers call correct functions
  - Test label text changes based on selection state
  - File: `apps/web/components/gifts/__tests__/SelectAllButton.test.tsx`

- [ ] **Task 3.2**: Integration tests for selection flow
  - Start selection mode
  - Click SelectAll button (page level)
  - Verify all gifts marked selected
  - Open BulkActionBar
  - Perform bulk action (delete or status change)
  - Verify selections cleared
  - File: `apps/web/__tests__/gifts-selection.integration.test.ts`

- [ ] **Task 3.3**: E2E test for bulk delete workflow
  - Navigate to gifts
  - Enter selection mode
  - Select multiple gifts
  - Use bulk action to delete
  - Verify deletion success
  - File: `apps/web/__tests__/e2e/bulk-gift-operations.spec.ts`

- [ ] **Task 3.4**: Mobile accessibility testing
  - Touch targets all ≥44px
  - Safe area insets respected in BulkActionBar
  - Responsive layout on mobile, tablet, desktop
  - Manual testing on iOS/Android if possible

- [ ] **Task 3.5**: Accessibility audit
  - Run axe-core against selection mode UI
  - Test keyboard navigation (Tab, Enter, Escape)
  - Verify ARIA labels on checkboxes and buttons
  - Screen reader testing (at least one tool)

- [ ] **Task 3.6**: Visual polish and refinement
  - Review spacing/margins around SelectAll buttons
  - Ensure consistent button styling (variant, size)
  - Smooth animations on button state changes
  - No layout shift when buttons appear/disappear

- [ ] **Task 3.7**: Documentation updates
  - Comment SelectAllButton component with examples
  - Update CLAUDE.md with selection mode pattern if needed
  - Add JSDoc for modified GiftGroupedView props
  - File: `apps/web/CLAUDE.md` (if pattern changes)

---

## Communication & Status Tracking

**Status Updates**: Track in `.claude/progress/gift-select-enhancements-v1/phase-X-progress.md`

**Blockers**: If any phase encounters issues:
1. Document blocker in progress file
2. Update this plan with revised timeline
3. Notify project lead immediately

**Sign-Off**: Each phase requires code review before proceeding to next:
- Phase 1: ui-engineer-enhanced ✓
- Phase 2: ui-engineer-enhanced ✓
- Phase 3: ui-engineer-enhanced + documentation-writer ✓

---

## Post-Implementation

### Verification Checklist

- [ ] All checkboxes visible in grid and grouped views
- [ ] "Select All" buttons appear and function correctly
- [ ] BulkActionBar integrates without breaking selection mode
- [ ] All existing gift management features still work (filter, sort, group)
- [ ] No performance degradation
- [ ] Mobile touch targets ≥44px
- [ ] Accessibility compliance verified
- [ ] Code merged to main branch

### Future Enhancements (Out of Scope)

- Keyboard shortcuts for bulk selection (Ctrl+A)
- Undo/redo for bulk operations
- Bulk reassignment to multiple people
- Selection persistence across page navigation
- Export selected gifts as CSV/PDF

---

## References

### Core Documentation

- **Gifts Action Bar PRD**: `/docs/project_plans/PRDs/features/gifts-action-bar-v1.md`
- **Web Architecture**: `apps/web/CLAUDE.md`
- **Project Architecture**: `CLAUDE.md`

### Component References

- **GiftCard**: `apps/web/components/gifts/GiftCard.tsx`
- **GiftGroupedView**: `apps/web/components/gifts/GiftGroupedView.tsx`
- **BulkActionBar**: `apps/web/components/gifts/BulkActionBar.tsx`
- **GiftToolbar**: `apps/web/components/gifts/GiftToolbar.tsx`

### Hook References

- **useGiftSelection**: `apps/web/hooks/useGiftSelection.ts`
- **useGifts**: `apps/web/hooks/useGifts.ts` (data loading)

---

## Detailed Task Breakdown

### Phase 1 Deep Dive: GiftGroupedView Checkbox Fix

**Current State**:
- GiftGroupedView renders GiftCard components without passing selection props
- GiftCard has checkbox logic but props aren't provided
- Selection mode exists but doesn't work in grouped view

**Implementation**:

1. **GiftGroupedView Props Addition**:
   ```tsx
   interface GiftGroupedViewProps {
     // ... existing props ...
     selectionMode: boolean;
     isSelected: (id: number) => boolean;
     onToggleSelection: (id: number) => void;
   }
   ```

2. **Checkbox Passing in GiftCard Render**:
   ```tsx
   {gifts.map(gift => (
     <GiftCard
       key={gift.id}
       gift={gift}
       // NEW PROPS:
       selectionMode={selectionMode}
       isSelected={isSelected(gift.id)}
       onToggleSelection={() => onToggleSelection(gift.id)}
       // ... existing props ...
     />
   ))}
   ```

3. **GiftsPage Integration**:
   ```tsx
   <GiftGroupedView
     gifts={data?.items || []}
     groupBy={groupBy}
     // NEW PROPS:
     selectionMode={selection.isSelectionMode}
     isSelected={selection.isSelected}
     onToggleSelection={selection.toggleSelection}
     // ... existing props ...
   />
   ```

### Phase 1 Deep Dive: BulkActionBar Integration

**Current State**:
- BulkActionBar component built and exported
- Not imported into GiftsPage
- Selection bar only has "Clear Selection" button

**Implementation**:

1. **GiftsPage Import**:
   ```tsx
   import { BulkActionBar } from '@/components/gifts/BulkActionBar';
   ```

2. **Render at Bottom**:
   ```tsx
   {selection.selectedIds.size > 0 && (
     <BulkActionBar
       selectedIds={selection.selectedIds}
       onClear={selection.clearSelection}
       onActionComplete={() => {
         // Optionally refetch gifts after bulk action
         refetch();
       }}
     />
   )}
   ```

3. **CSS Consideration**: Ensure bottom bar doesn't overlap gift content on mobile (use padding-bottom on main content or position aware layout).

### Phase 2 Deep Dive: SelectAll Button Component

**SelectAllButton.tsx**:
```tsx
export interface SelectAllButtonProps {
  isSelectionMode: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SelectAllButton({
  isSelectionMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
}: SelectAllButtonProps) {
  if (!isSelectionMode) return null;

  const isAllSelected = selectedCount > 0 && selectedCount === totalCount;

  return (
    <Button
      variant="outline"
      onClick={isAllSelected ? onDeselectAll : onSelectAll}
    >
      {isAllSelected ? 'Deselect All' : `Select All (${totalCount})`}
    </Button>
  );
}
```

**Integration in GiftsPage**:
```tsx
{selection.isSelectionMode && (
  <SelectAllButton
    isSelectionMode={selection.isSelectionMode}
    selectedCount={selection.selectedIds.size}
    totalCount={data?.items?.length || 0}
    onSelectAll={() => selection.selectAll(
      data?.items?.map(g => g.id) || []
    )}
    onDeselectAll={selection.clearSelection}
  />
)}
```

---

**Total Lines**: ~650
**Status**: Ready for implementation delegation
**Next Step**: Delegate Phase 1 to ui-engineer-enhanced agent
