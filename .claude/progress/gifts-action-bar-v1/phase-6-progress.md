---
# === PROGRESS TRACKING: GIFTS ACTION BAR V1 - PHASE 6 ===
# Testing, polish, accessibility, and documentation

# Metadata
type: progress
prd: "gifts-action-bar-v1"
phase: 6
title: "Testing & Polish"
status: "planning"
started: null
completed: null

# Progress Metrics
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 7
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["code-reviewer"]
contributors: ["ui-engineer-enhanced", "frontend-developer"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "TASK-6.1"
    description: "Write unit tests for new components (StatusButton, ListPickerDropdown, PriceEditDialog)"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "3pt"
    priority: "high"

  - id: "TASK-6.2"
    description: "Write integration tests for mutations (status, list, price, Santa)"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "2pt"
    priority: "high"

  - id: "TASK-6.3"
    description: "Write E2E test for complete action bar workflow"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["TASK-6.1", "TASK-6.2"]
    estimated_effort: "2pt"
    priority: "high"

  - id: "TASK-6.4"
    description: "Accessibility audit (WCAG 2.1 AA, axe-core)"
    status: "pending"
    assigned_to: ["code-reviewer"]
    dependencies: []
    estimated_effort: "2pt"
    priority: "high"

  - id: "TASK-6.5"
    description: "Mobile responsiveness validation (touch targets, safe areas)"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-6.6"
    description: "Performance testing (Lighthouse, <500ms interactions)"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "1pt"
    priority: "medium"

  - id: "TASK-6.7"
    description: "Component documentation update"
    status: "pending"
    assigned_to: ["documentation-writer"]
    dependencies: ["TASK-6.1"]
    estimated_effort: "1pt"
    priority: "low"

# Parallelization Strategy
parallelization:
  batch_1: ["TASK-6.1", "TASK-6.2", "TASK-6.4", "TASK-6.5", "TASK-6.6"]
  batch_2: ["TASK-6.3", "TASK-6.7"]
  critical_path: ["TASK-6.1", "TASK-6.3"]
  estimated_total_time: "5 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-6.1", description: "Unit test coverage >80% for new components", status: "pending" }
  - { id: "SC-6.2", description: "Integration tests cover all mutations", status: "pending" }
  - { id: "SC-6.3", description: "E2E test passes for full workflow", status: "pending" }
  - { id: "SC-6.4", description: "Zero critical accessibility issues (axe-core)", status: "pending" }
  - { id: "SC-6.5", description: "All touch targets 44px+ verified", status: "pending" }
  - { id: "SC-6.6", description: "Interactions <500ms (Lighthouse)", status: "pending" }
  - { id: "SC-6.7", description: "Component docs updated", status: "pending" }

# Files Modified
files_modified:
  - "apps/web/__tests__/components/gifts/StatusButton.test.tsx"
  - "apps/web/__tests__/components/gifts/ListPickerDropdown.test.tsx"
  - "apps/web/__tests__/components/gifts/PriceEditDialog.test.tsx"
  - "apps/web/__tests__/integration/gifts-action-bar-workflow.test.tsx"
  - "apps/web/__tests__/e2e/gifts-action-bar.spec.ts"
---

# Gifts Action Bar v1 - Phase 6: Testing & Polish

**Phase**: 6 (final) of 3 phase groups
**Status**: Planning (0% complete)
**Duration**: 5 days (Days 11-15)
**Story Points**: 12 pts
**Owner**: code-reviewer
**Contributors**: ui-engineer-enhanced, frontend-developer, documentation-writer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Most tasks can run in parallel):
- TASK-6.1 → `ui-engineer-enhanced` (3pt) - Unit tests
- TASK-6.2 → `frontend-developer` (2pt) - Integration tests
- TASK-6.4 → `code-reviewer` (2pt) - Accessibility audit
- TASK-6.5 → `ui-engineer-enhanced` (1pt) - Mobile validation
- TASK-6.6 → `frontend-developer` (1pt) - Performance testing

**Batch 2** (After Batch 1):
- TASK-6.3 → `frontend-developer` (2pt) - E2E test
- TASK-6.7 → `documentation-writer` (1pt) - Component docs

**Critical Path**: TASK-6.1 → TASK-6.3

### Task Delegation Commands

```
# Batch 1 - Testing (Launch ALL in parallel)
Task("ui-engineer-enhanced", "TASK-6.1: Write unit tests for new components.
Files:
- apps/web/__tests__/components/gifts/StatusButton.test.tsx
- apps/web/__tests__/components/gifts/ListPickerDropdown.test.tsx
- apps/web/__tests__/components/gifts/PriceEditDialog.test.tsx

Test coverage requirements:
- Component renders correctly
- Props passed correctly
- Callbacks fire on interaction
- Mutations called with correct args
- Error states handled
- Disabled state during isPending

Use Vitest + React Testing Library.
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-6-testing.md")

Task("frontend-developer", "TASK-6.2: Write integration tests for mutations.
File: apps/web/__tests__/integration/gifts-action-bar-workflow.test.tsx

Test scenarios:
- Status change via StatusButton
- List assignment via ListPickerDropdown
- Price update via PriceEditDialog
- Santa toggle mutation
- Error handling (mock failures)
- Optimistic update rollback

Use React Query test utilities with mock QueryClient.
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-6-testing.md")

Task("code-reviewer", "TASK-6.4: Perform accessibility audit (WCAG 2.1 AA).
Scope: All new components and GiftCard changes

Audit checklist:
- Run axe-core on all new components
- Verify keyboard navigation (Tab, Enter, Escape)
- Check ARIA labels on buttons and dropdowns
- Verify focus management in dialogs
- Check color contrast ratios
- Verify screen reader announcements

Document any issues found and fixes required.")

Task("ui-engineer-enhanced", "TASK-6.5: Validate mobile responsiveness.
Scope: GiftCard action bar on iPhone SE, iPad, desktop

Validation checklist:
- All touch targets 44x44px minimum
- Safe areas respected (iOS notch, home indicator)
- Dropdowns position correctly on small screens
- No horizontal scroll on mobile
- Action bar fits within card width
- Mobile overflow menu contains all options")

Task("frontend-developer", "TASK-6.6: Perform performance testing.
Tools: Chrome DevTools, Lighthouse

Performance targets:
- Interaction latency <500ms
- No layout shift on button clicks
- Dropdown opens <200ms
- Filter applies <300ms
- No memory leaks on mount/unmount

Document any performance issues found.")

# Batch 2 - E2E and Docs (After Batch 1)
Task("frontend-developer", "TASK-6.3: Write E2E test for complete action bar workflow.
File: apps/web/__tests__/e2e/gifts-action-bar.spec.ts

Test flow:
1. Navigate to /gifts page
2. Find a gift card
3. Change status via StatusButton
4. Assign to list via ListPickerDropdown
5. Click status chip to filter
6. Edit price via PriceEditDialog
7. Toggle From Santa flag
8. Verify Santa icon appears
9. Clear filters
10. Verify all changes persisted

Use Playwright.
See: docs/project_plans/implementation_plans/features/gifts-action-bar-v1/phase-6-testing.md")

Task("documentation-writer", "TASK-6.7: Update component documentation.
Files to document:
- StatusButton: Props, usage example, accessibility notes
- ListPickerDropdown: Props, multi-select behavior, Create List integration
- PriceEditDialog: Props, validation rules, popover positioning

Add to component docs directory or README.")
```

---

## Overview

Phase 6 ensures all features are thoroughly tested, accessible, and performant before release.

**Why This Phase**: Validates quality, accessibility, and performance for production release.

**Scope**:
- IN: Unit tests, integration tests, E2E tests, accessibility audit, mobile validation, performance testing, documentation
- OUT: New feature development (Phases 1-5)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-6.1 | Unit test coverage >80% | Pending |
| SC-6.2 | Integration tests cover all mutations | Pending |
| SC-6.3 | E2E test passes | Pending |
| SC-6.4 | Zero critical a11y issues | Pending |
| SC-6.5 | All touch targets 44px+ | Pending |
| SC-6.6 | Interactions <500ms | Pending |
| SC-6.7 | Component docs updated | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est |
|----|------|--------|-------|--------------|-----|
| TASK-6.1 | Unit tests for components | Pending | ui-engineer-enhanced | None | 3pt |
| TASK-6.2 | Integration tests for mutations | Pending | frontend-developer | None | 2pt |
| TASK-6.3 | E2E test for workflow | Pending | frontend-developer | 6.1, 6.2 | 2pt |
| TASK-6.4 | Accessibility audit | Pending | code-reviewer | None | 2pt |
| TASK-6.5 | Mobile validation | Pending | ui-engineer-enhanced | None | 1pt |
| TASK-6.6 | Performance testing | Pending | frontend-developer | None | 1pt |
| TASK-6.7 | Component documentation | Pending | documentation-writer | 6.1 | 1pt |

---

## Architecture Context

### Test Files
- `apps/web/__tests__/components/gifts/` - Component unit tests
- `apps/web/__tests__/integration/` - Integration tests
- `apps/web/__tests__/e2e/` - End-to-end tests (Playwright)

### Testing Tools
- Vitest - Unit test runner
- React Testing Library - Component testing
- Playwright - E2E testing
- axe-core - Accessibility testing
- Lighthouse - Performance auditing

---

## Testing Strategy

| Test Type | Coverage Target | Tool | Status |
|-----------|-----------------|------|--------|
| Unit | >80% | Vitest + RTL | Pending |
| Integration | All mutations | Vitest + RTL | Pending |
| E2E | Happy path + error | Playwright | Pending |
| A11y | WCAG 2.1 AA | axe-core | Pending |
| Performance | <500ms | Lighthouse | Pending |

---

## Next Session Agenda

1. [ ] Start unit tests for StatusButton
2. [ ] Start integration tests for mutations
3. [ ] Run accessibility audit
4. [ ] Validate mobile touch targets

---

## Session Notes

*(Session notes will be added as work progresses)*
