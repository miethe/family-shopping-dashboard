---
# Phase 2: Layout & Navigation
type: progress
prd: "ui-overhaul-v2"
phase: 2
title: "Layout & Navigation"
status: "planning"
started: "2025-11-30"
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 4
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["ui-engineer-enhanced"]
contributors: ["frontend-developer"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "LN-001"
    description: "Create AppLayout component with fixed sidebar + header + main sections"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "critical"

  - id: "LN-002"
    description: "Build glassmorphic Sidebar with nav links, avatar, FAB button, tooltips"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["LN-001"]
    estimated_effort: "2SP"
    priority: "high"

  - id: "LN-003"
    description: "Create Mobile Bottom Nav fallback for sm: breakpoint"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["LN-001"]
    estimated_effort: "2SP"
    priority: "high"

  - id: "LN-004"
    description: "Build Header component with breadcrumbs, search, action buttons"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["LN-001"]
    estimated_effort: "2SP"
    priority: "high"

# Parallelization Strategy
parallelization:
  batch_1: ["LN-001"]
  batch_2: ["LN-002", "LN-003", "LN-004"]
  critical_path: ["LN-001", "LN-002"]
  estimated_total_time: "3-4 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "AppLayout renders with correct ml-offset", status: "pending" }
  - { id: "SC-2", description: "Sidebar glassmorphism visible; active states work", status: "pending" }
  - { id: "SC-3", description: "Header sticky; breadcrumbs navigate", status: "pending" }
  - { id: "SC-4", description: "Mobile nav appears on sm: breakpoint", status: "pending" }
  - { id: "SC-5", description: "Safe-areas respected on notched devices", status: "pending" }
  - { id: "SC-6", description: "Responsive grid layouts pass Lighthouse audit", status: "pending" }

# Files Modified
files_modified:
  - "/apps/web/components/layout/AppLayout.tsx"
  - "/apps/web/components/layout/Sidebar.tsx"
  - "/apps/web/components/layout/Header.tsx"
  - "/apps/web/components/layout/MobileNav.tsx"
---

# UI Overhaul V2 - Phase 2: Layout & Navigation

**Phase**: 2 of 6
**Status**: Planning (0% complete)
**Duration**: 3-4 days | **Story Points**: 8
**Owner**: ui-engineer-enhanced
**Contributors**: frontend-developer

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Start - No Dependencies):
- LN-001 -> `ui-engineer-enhanced` (2SP)

**Batch 2** (After LN-001 Completes - Launch All in Parallel):
- LN-002 -> `ui-engineer-enhanced` (2SP) - **Depends on**: LN-001
- LN-003 -> `frontend-developer` (2SP) - **Depends on**: LN-001
- LN-004 -> `ui-engineer-enhanced` (2SP) - **Depends on**: LN-001

**Critical Path**: LN-001 -> LN-002 (4SP)

### Task Delegation Commands

```
# Batch 1 (Start first)
Task("ui-engineer-enhanced", "LN-001: Create AppLayout component with fixed layout structure.

Requirements:
- Fixed h-screen layout with Sidebar + Header + Main sections
- Main content offset: ml-20 md:ml-24 to account for sidebar
- Handle safe-areas for notched devices: env(safe-area-inset-*)
- Main content: overflow-y-auto with max-width 1600px container
- Support both sidebar and mobile nav rendering

Layout Structure:
AppLayout (fixed h-screen)
├── Sidebar (fixed w-20 md:w-24, glassmorphism)
├── Header (sticky, breadcrumbs + actions)
└── Main (ml-20 md:ml-24, overflow-y-auto)
    └── MaxWidth 1600px container

File: /apps/web/components/layout/AppLayout.tsx
Acceptance: Layout renders with correct ml-offset, sidebar fixed on desktop, safe-areas respected")

# Batch 2 (After Batch 1 - Launch in parallel)
Task("ui-engineer-enhanced", "LN-002: Build glassmorphic Sidebar navigation component.

Requirements:
- Fixed position, width w-20 md:w-24
- Glassmorphism effect: backdrop-blur-xl bg-white/80 dark:bg-gray-900/80
- Navigation links with Material Symbols icons
- Active state with coral highlight (primary color)
- User avatar at bottom
- FAB action button (add new gift)
- Tooltips on hover showing link names
- Rounded corners matching design system (rounded-3xl on outer edge)

File: /apps/web/components/layout/Sidebar.tsx
Acceptance: Sidebar w-20 md:w-24, active state shows, avatar & FAB render, tooltips appear on hover")

Task("frontend-developer", "LN-003: Create Mobile Bottom Nav fallback component.

Requirements:
- Show only on mobile (sm: breakpoint and below)
- Fixed to bottom with safe-area padding
- Same navigation items as Sidebar
- Active state matching Sidebar
- Glassmorphism background
- Hide on certain routes if needed (e.g., login)
- Don't overlap main content (add padding-bottom to main)

File: /apps/web/components/layout/MobileNav.tsx
Acceptance: Bottom nav appears on mobile, links active correctly, doesn't overlap content")

Task("ui-engineer-enhanced", "LN-004: Build Header component with breadcrumbs and actions.

Requirements:
- Sticky position at top of main content area
- Breadcrumb navigation (show current location)
- Search input (expandable on click)
- Action buttons aligned right (notifications, profile dropdown)
- Responsive collapse on mobile (hide search, show hamburger menu)
- Glassmorphism background matching sidebar

File: /apps/web/components/layout/Header.tsx
Acceptance: Header sticky, breadcrumbs navigate, search input works, actions aligned right")
```

---

## Overview

**Phase Goal**: Build the fixed sidebar, header, and main layout scaffold that provides the app's navigation structure.

**Why This Phase**: The layout provides the container for all page content. Without it, individual pages have no navigation or consistent structure.

**Scope**:
- IN: AppLayout, Sidebar, Header, MobileNav
- OUT: Page content, UI components, features

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | AppLayout renders with correct ml-offset | Pending |
| SC-2 | Sidebar glassmorphism visible; active states work | Pending |
| SC-3 | Header sticky; breadcrumbs navigate | Pending |
| SC-4 | Mobile nav appears on sm: breakpoint | Pending |
| SC-5 | Safe-areas respected on notched devices | Pending |
| SC-6 | Responsive grid layouts pass Lighthouse audit | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| LN-001 | AppLayout Component | Pending | ui-engineer-enhanced | None | 2SP | Fixed layout scaffold |
| LN-002 | Sidebar Navigation | Pending | ui-engineer-enhanced | LN-001 | 2SP | Glassmorphic nav |
| LN-003 | Mobile Bottom Nav | Pending | frontend-developer | LN-001 | 2SP | Mobile fallback |
| LN-004 | Header Component | Pending | ui-engineer-enhanced | LN-001 | 2SP | Breadcrumbs + search |

**Status Legend**:
- `Pending` - Not Started
- `In Progress` - Currently being worked on
- `Complete` - Finished
- `Blocked` - Waiting on dependency/blocker

---

## Architecture Context

### Layout Structure

```
AppLayout (fixed h-screen)
├── Sidebar (fixed w-20 md:w-24, glassmorphism)
├── Header (sticky, breadcrumbs + actions)
└── Main (ml-20 md:ml-24, overflow-y-auto)
    └── MaxWidth 1600px container
```

### Glassmorphism Pattern

```css
/* Glassmorphism effect */
backdrop-blur-xl bg-white/80 dark:bg-gray-900/80
border border-white/20
shadow-lg
```

### Reference Files

- **Inspiration Layout**: `inspiration/family-gifting-v2/components/Layout.tsx`
- **Inspiration Sidebar**: `inspiration/family-gifting-v2/components/Sidebar.tsx`

---

## Implementation Details

### Technical Approach

1. **LN-001**: Create shell AppLayout first - establishes the grid structure
2. **LN-002/003/004**: Once shell exists, sidebar, mobile nav, and header can be built in parallel
3. Each component slots into the AppLayout structure

### Known Gotchas

- Safe-area insets require testing on actual notched devices (iPhone X+)
- Glassmorphism performance on older devices - may need fallback
- Mobile nav must not conflict with sidebar visibility logic
- Header sticky position must account for safe-area-inset-top

### Mobile Breakpoints

- `sm:` 640px - Mobile nav threshold
- `md:` 768px - Sidebar expands from w-20 to w-24
- `lg:` 1024px - Full desktop experience

---

## Dependencies

### Phase Dependencies

- **Requires**: Phase 1 (Design System tokens)
- **Enables**: Phases 3-6 (all content needs layout)

### Internal Integration Points

- AppLayout wraps all pages
- Sidebar/Header use design tokens from Phase 1
- MobileNav must coordinate with Sidebar (only one visible at a time)

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Visual | Layout rendering | All breakpoints | Pending |
| Responsive | Breakpoint transitions | sm/md/lg | Pending |
| A11y | Navigation accessibility | Keyboard nav, ARIA | Pending |
| Device | Safe-area handling | iPhone 14 Pro emulation | Pending |

---

## Next Session Agenda

### Immediate Actions
1. [ ] Start LN-001: Create AppLayout shell
2. [ ] Test safe-area handling early
3. [ ] Verify glassmorphism works with design tokens

### Context for Continuing Agent

Phase 1 (Design System) must be complete before starting. Reference inspiration project for exact layout measurements. Start with AppLayout (LN-001) as all other tasks depend on it.

---

## Session Notes

### 2025-11-30

**Status**: Phase created, waiting for Phase 1 completion

**Next Session**:
- Begin LN-001: AppLayout component after Phase 1 is done

---

## Additional Resources

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **Inspiration Layout**: `inspiration/family-gifting-v2/components/Layout.tsx`
- **Inspiration Sidebar**: `inspiration/family-gifting-v2/components/Sidebar.tsx`
