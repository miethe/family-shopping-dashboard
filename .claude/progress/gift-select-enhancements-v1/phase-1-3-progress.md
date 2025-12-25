---
prd: gift-select-enhancements-v1
phase: "1-3"
status: in_progress
completion: 0%
started_at: 2025-12-25T00:00:00Z
tasks:
  # Phase 1: Fix Checkboxes + Integrate BulkActionBar
  - id: "TASK-1.1"
    title: "Modify GiftGroupedView to accept selection props"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_time: "1h"
  - id: "TASK-1.2"
    title: "Verify GiftCard checkbox logic and prop handling"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_time: "30m"
  - id: "TASK-1.3"
    title: "Import BulkActionBar into GiftsPage"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_time: "30m"
  - id: "TASK-1.4"
    title: "Wire GiftsPage selection props to GiftGroupedView"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.1"]
    estimated_time: "1h"
  # Phase 2: Add SelectAll Buttons
  - id: "TASK-2.1"
    title: "Create SelectAllButton component"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.4"]
    estimated_time: "1h"
  - id: "TASK-2.2"
    title: "Create GroupSelectAllButton component"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.4"]
    estimated_time: "1h"
  - id: "TASK-2.3"
    title: "Integrate SelectAllButton into GiftsPage"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1"]
    estimated_time: "30m"
  - id: "TASK-2.4"
    title: "Modify GiftGroupedView to include GroupSelectAllButton"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.2"]
    estimated_time: "1h"
  - id: "TASK-2.5"
    title: "Wire selectAll() calls with correct gift IDs"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.3", "TASK-2.4"]
    estimated_time: "1h"
  # Phase 3: Testing & Polish
  - id: "TASK-3.1"
    title: "Unit tests for SelectAll components"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "2h"
  - id: "TASK-3.2"
    title: "Integration tests for selection flow"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "2h"
  - id: "TASK-3.3"
    title: "E2E test for bulk delete workflow"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "2h"
  - id: "TASK-3.4"
    title: "Mobile accessibility testing"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "1h"
  - id: "TASK-3.5"
    title: "Accessibility audit"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "1h"
  - id: "TASK-3.6"
    title: "Visual polish and refinement"
    status: pending
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.5"]
    estimated_time: "1h"
  - id: "TASK-3.7"
    title: "Documentation updates"
    status: pending
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-2.5"]
    estimated_time: "1h"

parallelization:
  batch_1: ["TASK-1.1", "TASK-1.2", "TASK-1.3"]
  batch_2: ["TASK-1.4"]
  batch_3: ["TASK-2.1", "TASK-2.2"]
  batch_4: ["TASK-2.3", "TASK-2.4"]
  batch_5: ["TASK-2.5"]
  batch_6: ["TASK-3.1", "TASK-3.2", "TASK-3.3", "TASK-3.4", "TASK-3.5", "TASK-3.6", "TASK-3.7"]
  critical_path: ["TASK-1.1", "TASK-1.4", "TASK-2.1", "TASK-2.3", "TASK-2.5", "TASK-3.1"]
  estimated_total_time: "16h"
---

# Phase 1-3 Progress: Gift Select Mode Enhancements

## Implementation Summary

This phase implements enhanced gift selection capabilities including:
- Fix checkbox visibility in grouped views
- Add "Select All" buttons at page and status-group levels
- Integrate BulkActionBar for bulk actions
- Testing and polish

## Current State Analysis

### Files to Modify
- `apps/web/app/gifts/page.tsx` - Main integration point
- `apps/web/components/gifts/GiftGroupedView.tsx` - Pass selection props to GiftCard
- `apps/web/components/gifts/GiftCard.tsx` - Already has checkbox logic (verify only)

### Files to Create
- `apps/web/components/gifts/SelectAllButton.tsx` - Page-level select all
- `apps/web/components/gifts/GroupSelectAllButton.tsx` - Status-group select all

### Key Observations
1. GiftCard already has `selectionMode`, `isSelected`, and `onToggleSelection` props
2. GiftGroupedView does NOT pass these props to GiftCard - this is the root issue
3. useGiftSelection hook provides `selectAll(ids: number[])` method
4. BulkActionBar is already built but not integrated into GiftsPage
5. Selection bar exists but only shows count + clear button

## Work Log

### 2025-12-25

- [ ] Initialized progress tracking
- [ ] Analyzed current codebase state
- [ ] Starting Phase 1 implementation
