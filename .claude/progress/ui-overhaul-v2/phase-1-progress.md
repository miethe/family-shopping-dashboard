---
# Phase 1: Design System Foundation
type: progress
prd: "ui-overhaul-v2"
phase: 1
title: "Design System Foundation"
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
owners: ["ui-designer"]
contributors: ["frontend-developer", "ui-engineer-enhanced"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "DS-001"
    description: "Update Tailwind Config with custom colors, fonts, spacing tokens, shadow variants"
    status: "pending"
    assigned_to: ["ui-designer"]
    dependencies: []
    estimated_effort: "3SP"
    priority: "critical"

  - id: "DS-002"
    description: "Create Global CSS with animations, CSS vars for semantic colors, safe-area support"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["DS-001"]
    estimated_effort: "2SP"
    priority: "high"

  - id: "DS-003"
    description: "Add Material Symbols Icons font and create icon mapping component"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["DS-001"]
    estimated_effort: "2SP"
    priority: "high"

  - id: "DS-004"
    description: "Configure Dark Mode with Tailwind dark: classes and theme toggle hook"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["DS-001", "DS-002"]
    estimated_effort: "1SP"
    priority: "medium"

# Parallelization Strategy
parallelization:
  batch_1: ["DS-001"]
  batch_2: ["DS-002", "DS-003"]
  batch_3: ["DS-004"]
  critical_path: ["DS-001", "DS-002", "DS-004"]
  estimated_total_time: "4-5 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "tailwind.config.ts updated with all design tokens", status: "pending" }
  - { id: "SC-2", description: "Material Symbols Outlined font loads correctly", status: "pending" }
  - { id: "SC-3", description: "All semantic color tokens defined and tested", status: "pending" }
  - { id: "SC-4", description: "Dark mode toggle works across all tokens", status: "pending" }
  - { id: "SC-5", description: "No console errors or warnings", status: "pending" }

# Files Modified
files_modified:
  - "/apps/web/tailwind.config.ts"
  - "/apps/web/app/globals.css"
  - "/apps/web/components/ui/icon.tsx"
  - "/apps/web/hooks/useDarkMode.ts"
  - "/apps/web/lib/cn.ts"
---

# UI Overhaul V2 - Phase 1: Design System Foundation

**Phase**: 1 of 6
**Status**: Planning (0% complete)
**Duration**: 4-5 days | **Story Points**: 8
**Owner**: ui-designer
**Contributors**: frontend-developer, ui-engineer-enhanced

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Start - No Dependencies):
- DS-001 -> `ui-designer` (3SP)

**Batch 2** (After DS-001 Completes):
- DS-002 -> `frontend-developer` (2SP) - **Depends on**: DS-001
- DS-003 -> `ui-engineer-enhanced` (2SP) - **Depends on**: DS-001

**Batch 3** (After DS-002 Completes):
- DS-004 -> `frontend-developer` (1SP) - **Depends on**: DS-001, DS-002

**Critical Path**: DS-001 -> DS-002 -> DS-004 (6SP)

### Task Delegation Commands

```
# Batch 1 (Start first)
Task("ui-designer", "DS-001: Update Tailwind Config with design system tokens.

Requirements:
- Add custom colors: Primary Coral #E57373, primary-dark #D32F2F, background #FBF9F6
- Add fonts: Poppins (display), Quicksand (body), Spline Sans (kanban)
- Add spacing tokens, border-radius variants (32px, 24px, 16px)
- Add soft shadow variants with colored options (shadow-primary/30)
- Configure status colors: Idea (yellow), To Buy (red), Purchased (teal), Gifted (purple)

File: /apps/web/tailwind.config.ts
Acceptance: All tokens configured, fonts loaded, primary color is E57373")

# Batch 2 (After Batch 1 - Launch in parallel)
Task("frontend-developer", "DS-002: Create Global CSS with animations and CSS variables.

Requirements:
- Import Material Symbols Outlined font
- Create fade-in, slide-up, scale animations (300-400ms duration)
- Define CSS variables for semantic colors
- Add safe-area support with env(safe-area-inset-*)
- Support prefers-reduced-motion

File: /apps/web/app/globals.css
Acceptance: Animations smooth (60fps), Material Symbols imported, safe-area vars applied")

Task("ui-engineer-enhanced", "DS-003: Add Material Symbols Icons font and create icon component.

Requirements:
- Add Material Symbols Outlined font to the project
- Create Icon component with name prop mapping to Material Symbols class names
- Support all icons used in design: lightbulb, shopping_cart, check_circle, volunteer_activism, etc.
- Add proper TypeScript types for icon names

File: /apps/web/components/ui/icon.tsx
Acceptance: Icons render correctly in all contexts, TypeScript types work")

# Batch 3 (After Batch 2)
Task("frontend-developer", "DS-004: Configure Dark Mode with Tailwind and theme toggle hook.

Requirements:
- Configure Tailwind dark: class-based dark mode
- Create useDarkMode hook with localStorage persistence
- Ensure all semantic color tokens have dark variants
- Toggle should update document class and persist setting

File: /apps/web/hooks/useDarkMode.ts
Acceptance: Dark mode toggles correctly, all colors have dark variants, localStorage persists")
```

---

## Overview

**Phase Goal**: Establish the foundational design tokens, fonts, icons, and core styles that all subsequent phases will build upon.

**Why This Phase**: A solid design system foundation ensures visual consistency across all components and pages. This must be completed first as all UI work depends on these tokens.

**Scope**:
- IN: Tailwind config, global CSS, icon font, dark mode toggle
- OUT: Individual components, layout, pages

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | `tailwind.config.ts` updated with all design tokens | Pending |
| SC-2 | Material Symbols Outlined font loads correctly | Pending |
| SC-3 | All semantic color tokens defined and tested | Pending |
| SC-4 | Dark mode toggle works across all tokens | Pending |
| SC-5 | No console errors or warnings | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| DS-001 | Update Tailwind Config | Pending | ui-designer | None | 3SP | Colors, fonts, shadows |
| DS-002 | Global CSS & Animations | Pending | frontend-developer | DS-001 | 2SP | Animations, CSS vars |
| DS-003 | Material Symbols Icons | Pending | ui-engineer-enhanced | DS-001 | 2SP | Icon font, component |
| DS-004 | Dark Mode Setup | Pending | frontend-developer | DS-001, DS-002 | 1SP | Toggle hook, persistence |

**Status Legend**:
- `Pending` - Not Started
- `In Progress` - Currently being worked on
- `Complete` - Finished
- `Blocked` - Waiting on dependency/blocker

---

## Architecture Context

### Design System Tokens

**Primary Color**: Coral (#E57373) with variants (primary-dark: #D32F2F)
**Background**: Creamy off-white (#FBF9F6) / Dark mode support
**Fonts**: Poppins (display), Quicksand (body), Spline Sans (kanban)
**Border Radius**: Standard 32px (rounded-3xl), 24px (rounded-2xl), 16px (rounded-xl)
**Shadows**: Soft layered shadows with colored variants (shadow-primary/30)
**Icons**: Material Symbols Outlined (material-symbols-outlined class)

### Status Colors

| Status | Light | Icon |
|--------|-------|------|
| Idea | bg-yellow-100 text-yellow-800 | lightbulb |
| To Buy | bg-red-100 text-red-800 | shopping_cart |
| Purchased | bg-teal-100 text-teal-800 | check_circle |
| Gifted | bg-purple-100 text-purple-800 | volunteer_activism |

### Reference Files

- **Inspiration**: `inspiration/family-gifting-v2/tailwind.config.ts`
- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`

---

## Implementation Details

### Technical Approach

1. **DS-001**: Start with Tailwind config - define all design tokens
2. **DS-002/DS-003**: Once tokens exist, can work in parallel on CSS and icons
3. **DS-004**: Dark mode depends on CSS variables being defined

### Known Gotchas

- Material Symbols font must be loaded from Google Fonts or self-hosted
- Dark mode class must be on `html` element, not `body`
- Ensure all color tokens have both light and dark variants
- Test font loading on slow connections

---

## Dependencies

### External Dependencies

- None (foundation phase)

### Phase Dependencies

- This phase has no dependencies
- All subsequent phases (2-6) depend on Phase 1 completion

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Visual | Token rendering | All colors, fonts, shadows | Pending |
| Functional | Dark mode toggle | Toggle + persistence | Pending |
| Performance | Font loading | No FOUT/FOIT | Pending |

---

## Next Session Agenda

### Immediate Actions
1. [ ] Start DS-001: Update Tailwind config with all design tokens
2. [ ] Verify fonts can be loaded (Google Fonts or local)
3. [ ] Create cn() utility if not exists

### Context for Continuing Agent

Start with DS-001 (Tailwind config) as all other tasks depend on it. Reference the inspiration project at `inspiration/family-gifting-v2/` for exact color values and font choices.

---

## Session Notes

### 2025-11-30

**Status**: Phase created, ready to start implementation

**Next Session**:
- Begin DS-001: Tailwind config with design tokens

---

## Additional Resources

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **Inspiration Project**: `inspiration/family-gifting-v2/`
- **Design Reference**: `docs/designs/asthetic-v1.md`
