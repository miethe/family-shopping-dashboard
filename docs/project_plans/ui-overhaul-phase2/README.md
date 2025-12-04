# UI Overhaul V2 — Implementation Plan Suite

**Project**: Family Gifting Dashboard Complete UI Redesign
**Status**: Ready for Sprint Planning
**Complexity**: Large (L) | **Track**: Full
**Total Effort**: ~55 story points
**Timeline**: 5-6 weeks
**Created**: 2025-11-30

---

## Overview

This directory contains a comprehensive, actionable implementation plan for redesigning the Family Gifting Dashboard frontend to match the new inspiration project at `/inspiration/family-gifting-v2/`.

The plan includes:
- **6 sequential phases** with detailed task breakdowns
- **~30 components** across layout, UI primitives, and features
- **5 fully designed pages** with responsive layouts
- **Full backend integration** with React Query + WebSocket
- **Production-ready quality** including a11y, performance, and E2E testing

---

## Document Structure

### 1. **ui-overhaul-v2-implementation.md** (Main Plan)
**444 lines | 23KB**

The comprehensive implementation plan covering:
- Executive summary with success criteria
- Architecture overview (design system, layout stack, status colors)
- 6-phase breakdown with detailed task tables
- Task summary by phase with effort estimates
- Component inventory (30+ components listed)
- Subagent assignments
- Dependencies & sequencing
- Quality gates per phase
- Risk mitigation strategies
- File structure diagram
- Inspiration project references
- Success metrics

**Read this first** for complete understanding of scope and approach.

### 2. **PHASE-DETAILS.md** (Implementation Reference)
**610 lines | 15KB**

Code examples and technical patterns for each phase:
- DS-001 to DS-004: Design system implementation (Tailwind, CSS, icons, dark mode)
- LN-001 to LN-004: Layout components with code samples
- UC-001 to UC-010: UI component patterns (Button, Modal, Badge, Table, etc.)
- PG-002, PG-004, PG-005: Page layout patterns (Dashboard, Kanban, Table)
- FC-001 to FC-007: Feature components and backend integration patterns
- React Query hook patterns
- WebSocket integration patterns
- Drag-drop implementation
- E2E test examples
- Inspiration project file mapping

**Use this during implementation** for code templates and patterns.

### 3. **IMPLEMENTATION-CHECKLIST.md** (Task Tracking)
**512 lines | 15KB**

Detailed task-by-task checklist for all 6 phases:
- Phase 1: Design System (4 tasks, 8 SP)
- Phase 2: Layout & Navigation (4 tasks, 8 SP)
- Phase 3: UI Component Library (10 tasks, 12 SP)
- Phase 4: Page Implementations (6 tasks, 14 SP)
- Phase 5: Feature Components & Integration (7 tasks, 13 SP)
- Phase 6: Polish & Testing (5 tasks, 8 SP)

Each task includes:
- [ ] Sub-task checkboxes
- Assigned agent
- PR reference field
- Completion status
- Quality gates per phase
- Blocker tracking
- Sign-off section

**Use this during sprint execution** to track progress and completion.

### 4. **QUICK-START.md** (Quick Reference)
**310 lines | 9KB**

Executive summary for quick orientation:
- What's changing (visual design, experiences, components)
- Files to reference (inspiration project + docs)
- 6-phase breakdown (condensed view)
- Component inventory summary
- Key technical patterns
- Subagent assignments
- Quality checklist (per phase)
- Common issues & solutions
- Getting started steps
- Key directories
- Success criteria

**Use this for onboarding** new team members and daily standup reference.

### 5. **README.md** (This File)
Navigation guide and document index.

---

## How to Use These Documents

### For Project Kickoff
1. Read: **QUICK-START.md** (15 min overview)
2. Read: **ui-overhaul-v2-implementation.md** (full context)
3. Print: **IMPLEMENTATION-CHECKLIST.md** (start Phase 1)

### For Daily Development
1. Reference: **PHASE-DETAILS.md** (code patterns)
2. Update: **IMPLEMENTATION-CHECKLIST.md** (track progress)
3. Consult: **QUICK-START.md** (common issues)

### For Phase Reviews
1. Review: Quality gates in **ui-overhaul-v2-implementation.md**
2. Verify: All checkboxes in **IMPLEMENTATION-CHECKLIST.md**
3. Validate: Against **PHASE-DETAILS.md** patterns

### For Integration Issues
1. Consult: **PHASE-DETAILS.md** (patterns section)
2. Reference: `inspiration/family-gifting-v2/` files
3. Check: **QUICK-START.md** (common issues)

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Total Story Points | ~55 |
| Phases | 6 |
| Components | 30+ |
| Pages | 5 |
| Tasks | ~40 |
| Estimated Timeline | 5-6 weeks |
| Design System Tokens | 50+ |
| E2E Tests Required | 10+ |
| Target Accessibility | WCAG AA (0 violations) |
| Target Performance | FCP <2.5s, LCP <4s on 3G |

---

## Phase Timeline

```
Week 1:  Phase 1 (Design System)          [████░░░░░░]
Week 2:  Phase 2 (Layout & Nav)           [████░░░░░░]
Week 3:  Phase 3 (UI Components)          [██████░░░░]
Week 4:  Phase 4 (Pages)                  [██████░░░░]
Week 5:  Phase 5 (Integration)            [██████░░░░]
Week 6:  Phase 6 (Polish & Testing)       [████░░░░░░]
```

---

## Component Summary

**Layout (4)**:
- AppLayout, Sidebar, Header, MobileNav

**UI Primitives (12)**:
- Button (4 variants), Card (3 variants), Input, Badge, Avatar, Modal
- Stats Card, Timeline, Table, SearchBar

**Feature Components (8)**:
- GiftDetailsModal, GiftForm, KanbanBoard, KanbanColumn
- RecipientDetailsModal, RecipientForm, ListCard, OccasionCard

**Pages (5)**:
- Login (split-screen), Dashboard (5/7 grid), Lists (filter + grid)
- ListDetails (Kanban + Table toggle), Recipients (filter tabs)

**Total**: ~30 components across ~2000 LOC

---

## Design System Highlights

**Colors**:
- Primary: Coral #E57373 (was #E07A5F)
- Background: #FBF9F6 creamy off-white
- Status: Idea (yellow), To Buy (red), Purchased (teal), Gifted (purple)

**Typography**:
- Display: Poppins (headers)
- Body: Quicksand (text)
- Kanban: Spline Sans (board)

**Spacing & Radius**:
- Default radius: 32px (rounded-3xl)
- Secondary radius: 24px (rounded-2xl)
- Touch target minimum: 44x44px

**Shadows**:
- Soft: 0 1px 3px rgba(0,0,0,0.08)
- Card: 0 4px 12px rgba(0,0,0,0.08)
- Layer: 0 10px 25px rgba(0,0,0,0.1)

---

## Quality Gates

### Phase 1 Completion
- Tailwind config loads without errors
- Material Symbols Outlined font renders
- All semantic color tokens defined
- Dark mode toggle functional

### Phase 2 Completion
- Layout renders with correct ml-offset
- Sidebar glassmorphism visible
- Safe-areas respected on iOS notch
- Mobile nav shows on sm: breakpoint

### Phase 3 Completion
- All 12 components built and exported
- 44px minimum touch targets
- Zero axe accessibility violations
- Responsive to all breakpoints

### Phase 4 Completion
- 5 pages implemented and responsive
- Layouts match inspiration design
- Forms validate and submit
- All states handled correctly

### Phase 5 Completion
- API integration working
- WebSocket real-time updates
- Drag-drop functional
- Optimistic updates with rollback

### Phase 6 Completion
- Animations smooth (60fps)
- Axe reports 0 violations
- Keyboard navigation works
- 10+ E2E tests passing
- Lighthouse 90+ Performance, 95+ A11y

---

## Inspiration Project References

Key files to study during implementation:

| File | Purpose | For Task |
|------|---------|----------|
| `components/Layout.tsx` | Fixed layout pattern | LN-001 |
| `components/Sidebar.tsx` | Navigation styling | LN-002 |
| `components/Modal.tsx` | Modal structure | UC-006 |
| `pages/Dashboard.tsx` | Dashboard layout | PG-002 |
| `pages/ListDetails.tsx` | Kanban + Table + Modal | PG-004, PG-005, FC-003 |
| `pages/Login.tsx` | Auth page design | PG-001 |
| `pages/Recipients.tsx` | Recipients layout | PG-006 |
| `types.ts` | Data models | Hook interfaces |
| `package.json` | Dependencies | Setup |

**Location**: `/inspiration/family-gifting-v2/`

---

## Subagent Responsibilities

### ui-designer (Phase 1)
- Design tokens and color system
- Typography configuration
- Icon mapping and guidelines

### ui-engineer-enhanced (Phases 2-5)
- Layout and navigation components
- All UI primitive components (30+)
- Page implementations
- Feature components

### frontend-developer (Phases 1-6)
- Tailwind configuration
- Global CSS and animations
- React Query hooks
- WebSocket integration
- Drag-drop implementation
- E2E tests

### web-accessibility-checker (Phase 6)
- axe accessibility audit
- WCAG AA compliance verification
- Keyboard navigation testing
- ARIA label review

### react-performance-optimizer (Phase 6)
- Performance metrics measurement
- Code splitting and lazy loading
- Image optimization
- React DevTools profiling

---

## Getting Started Checklist

1. **Read Documentation**
   - [ ] QUICK-START.md (15 min)
   - [ ] ui-overhaul-v2-implementation.md (1 hour)
   - [ ] PHASE-DETAILS.md (reference during work)

2. **Setup & Review**
   - [ ] Clone/review inspiration project files
   - [ ] Review current `/apps/web/` structure
   - [ ] Setup development environment

3. **Sprint Planning**
   - [ ] Assign Phase 1 tasks to ui-designer & frontend-developer
   - [ ] Create PRs for each task
   - [ ] Setup daily standup tracking

4. **Begin Phase 1**
   - [ ] Start with tailwind.config.ts updates
   - [ ] Implement globals.css
   - [ ] Create Icon component
   - [ ] Setup dark mode hook

---

## File Locations

**Implementation Plans** (this directory):
- `/docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md` (main plan)
- `/docs/project_plans/ui-overhaul-phase2/PHASE-DETAILS.md` (code examples)
- `/docs/project_plans/ui-overhaul-phase2/IMPLEMENTATION-CHECKLIST.md` (task tracking)
- `/docs/project_plans/ui-overhaul-phase2/QUICK-START.md` (quick reference)
- `/docs/project_plans/ui-overhaul-phase2/README.md` (this file)

**Inspiration Project**:
- `/inspiration/family-gifting-v2/` (reference design)

**Implementation Starts**:
- `/apps/web/tailwind.config.ts` (Phase 1)
- `/apps/web/app/globals.css` (Phase 1)
- `/apps/web/components/layout/AppLayout.tsx` (Phase 2)
- `/apps/web/components/ui/button.tsx` (Phase 3)

---

## Support & Resources

### Design Questions
- Reference `inspiration/family-gifting-v2/` files
- Check **PHASE-DETAILS.md** for code patterns
- Review design system specifications

### Implementation Issues
- Check **QUICK-START.md** common issues section
- Reference **PHASE-DETAILS.md** patterns
- Consult CLAUDE.md for project guidelines

### Task Tracking
- Update **IMPLEMENTATION-CHECKLIST.md** daily
- Document blockers in `.claude/worknotes/`
- Record observations in `.claude/progress/`

### Quality Standards
- Follow patterns in **PHASE-DETAILS.md**
- Validate against quality gates before phase completion
- Run automated checks (axe, Lighthouse, tests)

---

## Success Metrics

**On Completion, the Team Will Have**:
- ✓ 6 phases complete (5-6 weeks)
- ✓ 5 pages matching inspiration design
- ✓ 30+ reusable components
- ✓ Real-time updates via WebSocket
- ✓ Functional Kanban drag-drop
- ✓ Zero accessibility violations
- ✓ 90+ Lighthouse Performance score
- ✓ 10+ E2E tests passing
- ✓ <2.5s FCP on 3G mobile

---

## Document Metadata

| Property | Value |
|----------|-------|
| Created | 2025-11-30 |
| Version | 1.0 |
| Status | Ready for Sprint Planning |
| Total Lines | 2,931 |
| Total Size | 100KB |
| Primary Author | Implementation Planner Orchestrator |
| Related PRD | `docs/project_plans/family-dashboard-v1/family-dashboard-v1.md` |
| Inspiration | `inspiration/family-gifting-v2/` |

---

## Quick Links

- **Start Here**: QUICK-START.md
- **Full Plan**: ui-overhaul-v2-implementation.md
- **Code Patterns**: PHASE-DETAILS.md
- **Task Tracking**: IMPLEMENTATION-CHECKLIST.md
- **Project Guide**: /CLAUDE.md
- **Inspiration**: /inspiration/family-gifting-v2/

---

**Ready to begin? Start with QUICK-START.md for a 15-minute overview.**
