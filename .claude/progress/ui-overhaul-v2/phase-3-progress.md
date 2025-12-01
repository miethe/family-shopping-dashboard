---
# Phase 3: UI Component Library
type: progress
prd: "ui-overhaul-v2"
phase: 3
title: "UI Component Library"
status: "planning"
started: "2025-11-30"
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 10
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["ui-engineer-enhanced"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "UC-001"
    description: "Create Button components with 4 variants, 4 sizes, disabled/loading states"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "critical"

  - id: "UC-002"
    description: "Create Card components with default, elevated, outline variants"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "high"

  - id: "UC-003"
    description: "Create Input & Form Field components with validation and error states"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "high"

  - id: "UC-004"
    description: "Create Badge & Pill components for status display"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "high"

  - id: "UC-005"
    description: "Create Avatar & Avatar Stack components with hover animations"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "medium"

  - id: "UC-006"
    description: "Create Modal component with header/body/footer structure"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "high"

  - id: "UC-007"
    description: "Create Stats Card component for dashboard metrics"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "medium"

  - id: "UC-008"
    description: "Create Timeline component for activity feeds"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "medium"

  - id: "UC-009"
    description: "Create Table component with sticky header, pagination, row actions"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "high"

  - id: "UC-010"
    description: "Create Filter & Search components with multi-select"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1SP"
    priority: "medium"

# Parallelization Strategy
parallelization:
  batch_1: ["UC-001", "UC-002", "UC-003", "UC-004", "UC-005"]
  batch_2: ["UC-006", "UC-007", "UC-008", "UC-009", "UC-010"]
  critical_path: ["UC-001"]
  estimated_total_time: "5-6 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "All 10 primitive components built and exported", status: "pending" }
  - { id: "SC-2", description: "Each component has 2-3 variants and states", status: "pending" }
  - { id: "SC-3", description: "Components responsive to sm/md/lg breakpoints", status: "pending" }
  - { id: "SC-4", description: "44px minimum touch targets on all interactive elements", status: "pending" }
  - { id: "SC-5", description: "Zero axe accessibility violations", status: "pending" }

# Files Modified
files_modified:
  - "/apps/web/components/ui/button.tsx"
  - "/apps/web/components/ui/card.tsx"
  - "/apps/web/components/ui/input.tsx"
  - "/apps/web/components/ui/badge.tsx"
  - "/apps/web/components/ui/avatar.tsx"
  - "/apps/web/components/ui/modal.tsx"
  - "/apps/web/components/ui/stats-card.tsx"
  - "/apps/web/components/ui/timeline.tsx"
  - "/apps/web/components/ui/table.tsx"
  - "/apps/web/components/ui/search-bar.tsx"
---

# UI Overhaul V2 - Phase 3: UI Component Library

**Phase**: 3 of 6
**Status**: Planning (0% complete)
**Duration**: 5-6 days | **Story Points**: 12
**Owner**: ui-engineer-enhanced
**Contributors**: None (single owner)

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (All Independent - Launch in Parallel):
- UC-001 -> `ui-engineer-enhanced` (2SP) - Buttons
- UC-002 -> `ui-engineer-enhanced` (1SP) - Cards
- UC-003 -> `ui-engineer-enhanced` (1SP) - Inputs
- UC-004 -> `ui-engineer-enhanced` (1SP) - Badges
- UC-005 -> `ui-engineer-enhanced` (1SP) - Avatars

**Batch 2** (All Independent - Launch in Parallel):
- UC-006 -> `ui-engineer-enhanced` (2SP) - Modal
- UC-007 -> `ui-engineer-enhanced` (1SP) - Stats Card
- UC-008 -> `ui-engineer-enhanced` (1SP) - Timeline
- UC-009 -> `ui-engineer-enhanced` (2SP) - Table
- UC-010 -> `ui-engineer-enhanced` (1SP) - Search/Filter

**Critical Path**: UC-001 (Buttons used by many other components)

**Note**: All tasks can run in parallel (no dependencies), but batched for manageable workload.

### Task Delegation Commands

```
# Batch 1 (Launch all in parallel - single message)
Task("ui-engineer-enhanced", "UC-001: Create Button component with all variants and states.

Requirements:
- Variants: primary (coral), secondary, ghost, outline
- Sizes: xs, sm, md, lg (md default, all >= 44px touch target)
- States: default, hover, active, disabled, loading (spinner)
- Use design tokens from tailwind.config.ts
- Include proper focus ring for accessibility
- Support icon-only buttons (square aspect ratio)

File: /apps/web/components/ui/button.tsx
Acceptance: All variants render, sizes match spec, loading spinner shows, 44px min touch target")

Task("ui-engineer-enhanced", "UC-002: Create Card component with variants.

Requirements:
- Variants: default (subtle shadow), elevated (stronger shadow), outline (border only)
- Composable: Card, CardHeader, CardBody, CardFooter
- Support optional hover effects (lift on hover)
- Responsive padding (smaller on mobile)
- Use rounded-3xl from design system

File: /apps/web/components/ui/card.tsx
Acceptance: Cards render with shadows, hover effects work, responsive padding")

Task("ui-engineer-enhanced", "UC-003: Create Input and Form Field components.

Requirements:
- Types: text, email, password (with toggle), number
- Label component integrated
- Error state with message display
- Disabled state
- Focus ring matching design system
- Support prefix/suffix icons

File: /apps/web/components/ui/input.tsx
Acceptance: Form fields validated, error messages show, disabled state works")

Task("ui-engineer-enhanced", "UC-004: Create Badge and Pill components.

Requirements:
- Status badges: Idea (yellow), To Buy (red), Purchased (teal), Gifted (purple)
- Support custom colors via prop
- Category pills with rounded-full shape
- Include icon support (left position)
- Size variants: sm, md

File: /apps/web/components/ui/badge.tsx
Acceptance: All 4 status colors render, icons show, inline with text")

Task("ui-engineer-enhanced", "UC-005: Create Avatar and Avatar Stack components.

Requirements:
- Single avatar with image or initials fallback
- Size variants: xs, sm, md, lg, xl
- Avatar stack with negative margin overlap (-space-x-2)
- Hover reveal animation (expand stack on hover)
- Border ring for contrast on varied backgrounds

File: /apps/web/components/ui/avatar.tsx
Acceptance: Avatar renders image, stack layers correctly, hover animation smooth")

# Batch 2 (After Batch 1 completes - launch all in parallel)
Task("ui-engineer-enhanced", "UC-006: Create Modal component with full structure.

Requirements:
- Base modal with backdrop blur overlay
- Composable: Modal, ModalHeader, ModalBody, ModalFooter
- Close button (X) in header
- Click outside to dismiss (with prop to disable)
- Escape key to close
- Focus trap for accessibility
- Animation: scale-in on open, fade-out on close
- Multiple sizes: sm, md, lg, xl, full

File: /apps/web/components/ui/modal.tsx
Acceptance: Modal mounts/unmounts, outside click closes, backdrop blur works")

Task("ui-engineer-enhanced", "UC-007: Create Stats Card component for dashboard.

Requirements:
- Large number display with label below
- Support trend indicator (up/down arrow + percentage)
- Hover lift effect
- Optional icon in corner
- Grid-friendly sizing (works in 3-column grid)

File: /apps/web/components/ui/stats-card.tsx
Acceptance: Stats render with correct sizing, hover lift effect, grid responsive")

Task("ui-engineer-enhanced", "UC-008: Create Timeline component for activity feeds.

Requirements:
- Timeline dots with vertical connector line
- Activity items with avatar, text, timestamp
- Support for different item types (comment, status change, etc.)
- Alternating or single-side layout option
- Smooth scroll behavior

File: /apps/web/components/ui/timeline.tsx
Acceptance: Timeline renders with vertical line, dots positioned correctly")

Task("ui-engineer-enhanced", "UC-009: Create Table component with full features.

Requirements:
- Sticky header on scroll
- Row hover highlight
- Sortable columns (click header to sort)
- Pagination component (prev/next, page numbers)
- Action menu per row (three-dot dropdown)
- Responsive: horizontal scroll on mobile
- Checkbox selection support

File: /apps/web/components/ui/table.tsx
Acceptance: Table renders, header sticky on scroll, hover rows, pagination works")

Task("ui-engineer-enhanced", "UC-010: Create Filter and Search components.

Requirements:
- SearchBar: Input with search icon, clear button, debounced onChange
- FilterBar: Multi-select dropdowns for filtering
- Clear all filters button
- Active filter pills showing current filters
- Responsive collapse to icon on mobile

File: /apps/web/components/ui/search-bar.tsx
Acceptance: Search filters list, filter dropdowns work, clear all resets")
```

---

## Overview

**Phase Goal**: Build all 30+ primitive UI components that will be composed into pages and features.

**Why This Phase**: These components are the building blocks for all pages. Having a consistent component library ensures visual coherence and reduces code duplication.

**Scope**:
- IN: 10 core UI component categories (buttons, cards, inputs, etc.)
- OUT: Feature-specific components (GiftForm, KanbanBoard) - those are Phase 5

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | All 10 primitive components built and exported | Pending |
| SC-2 | Each component has 2-3 variants and states | Pending |
| SC-3 | Components responsive to sm/md/lg breakpoints | Pending |
| SC-4 | 44px minimum touch targets on all interactive elements | Pending |
| SC-5 | Zero axe accessibility violations | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| UC-001 | Button Components | Pending | ui-engineer-enhanced | None | 2SP | 4 variants, 4 sizes |
| UC-002 | Card Components | Pending | ui-engineer-enhanced | None | 1SP | 3 variants |
| UC-003 | Input & Form Fields | Pending | ui-engineer-enhanced | None | 1SP | Validation, errors |
| UC-004 | Badge & Pill | Pending | ui-engineer-enhanced | None | 1SP | Status colors |
| UC-005 | Avatar & Stack | Pending | ui-engineer-enhanced | None | 1SP | Hover animation |
| UC-006 | Modal | Pending | ui-engineer-enhanced | None | 2SP | Composable parts |
| UC-007 | Stats Card | Pending | ui-engineer-enhanced | None | 1SP | Dashboard metrics |
| UC-008 | Timeline | Pending | ui-engineer-enhanced | None | 1SP | Activity feed |
| UC-009 | Table | Pending | ui-engineer-enhanced | None | 2SP | Sticky header, pagination |
| UC-010 | Filter & Search | Pending | ui-engineer-enhanced | None | 1SP | Multi-select |

**Status Legend**:
- `Pending` - Not Started
- `In Progress` - Currently being worked on
- `Complete` - Finished
- `Blocked` - Waiting on dependency/blocker

---

## Architecture Context

### Component Design Principles

1. **Composable**: Components should be composed together (Card + CardHeader + CardBody)
2. **Variant-based**: Use variant props rather than many separate components
3. **Accessible**: All components must pass axe accessibility checks
4. **Touch-friendly**: 44px minimum touch targets on mobile
5. **Token-based**: Use Tailwind design tokens, not hardcoded values

### Status Color System

| Status | Background | Text | Icon |
|--------|------------|------|------|
| Idea | bg-yellow-100 | text-yellow-800 | lightbulb |
| To Buy | bg-red-100 | text-red-800 | shopping_cart |
| Purchased | bg-teal-100 | text-teal-800 | check_circle |
| Gifted | bg-purple-100 | text-purple-800 | volunteer_activism |

### Reference Files

- **Inspiration Components**: `inspiration/family-gifting-v2/components/ui/`
- **Design System**: Phase 1 tailwind.config.ts

---

## Implementation Details

### Technical Approach

1. All components use design tokens from Phase 1
2. Use `cn()` utility for conditional class merging
3. Export both named and default exports
4. Include TypeScript interfaces for all props

### Component Structure Pattern

```typescript
// Example component structure
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <button className={cn(baseStyles, variantStyles[variant], sizeStyles[size])} {...props} />;
}
```

### Known Gotchas

- Modal focus trap needs careful implementation
- Table sticky header + horizontal scroll can conflict
- Avatar stack hover animation needs transform-origin consideration
- Badge text should truncate on overflow

---

## Dependencies

### Phase Dependencies

- **Requires**: Phase 1 (Design System tokens)
- **Requires**: Phase 2 (Layout foundation for context)
- **Enables**: Phase 4 (Pages use these components)

### Internal Integration Points

- All components use cn() utility from /lib/cn.ts
- All components use design tokens from tailwind.config.ts
- Icon component from Phase 1 (DS-003) used in buttons, badges, etc.

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Visual | Component rendering | All variants | Pending |
| A11y | axe audit | All components | Pending |
| Responsive | Breakpoint behavior | sm/md/lg | Pending |
| Interaction | States and events | Hover, focus, click | Pending |

---

## Next Session Agenda

### Immediate Actions
1. [ ] Start Batch 1: UC-001 through UC-005 in parallel
2. [ ] Test Button component first (most reused)
3. [ ] Run axe checks on each completed component

### Context for Continuing Agent

Phase 1 and Phase 2 should be complete. All components in this phase are independent - can be built in parallel. Start with Button (UC-001) as it's used by many other components.

---

## Session Notes

### 2025-11-30

**Status**: Phase created, waiting for Phase 1-2 completion

**Next Session**:
- Begin Batch 1: All 5 components can start in parallel

---

## Additional Resources

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **Inspiration UI**: `inspiration/family-gifting-v2/components/ui/`
- **Design Tokens**: `/apps/web/tailwind.config.ts`
