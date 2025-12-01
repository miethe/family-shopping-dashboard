---
type: progress
prd: "ui-overhaul-v2"
title: "UI Overhaul V2 - Family Gifting Dashboard Redesign"
status: not_started
progress: 0
total_tasks: 40
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
created: 2025-11-30
updated: 2025-11-30
owners: ["ui-engineer-enhanced"]
contributors: ["frontend-developer", "ui-designer", "react-performance-optimizer", "web-accessibility-checker"]
blockers: []
---

# UI Overhaul V2 Progress Tracking

**Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
**Inspiration Project**: `inspiration/family-gifting-v2/`
**Timeline**: 5-6 weeks (~55 story points)
**Last Updated**: 2025-11-30

---

## Phase Overview

| Phase | Title | Effort (SP) | Status | Completion % | Tasks |
|-------|-------|-----------|--------|-------------|-------|
| 1 | Design System Foundation | 8 | Not Started | 0% | 4 |
| 2 | Layout & Navigation | 8 | Not Started | 0% | 4 |
| 3 | UI Component Library | 12 | Not Started | 0% | 10 |
| 4 | Page Implementations | 14 | Not Started | 0% | 6 |
| 5 | Feature Components & Integration | 13 | Not Started | 0% | 7 |
| 6 | Polish & Testing | 8 | Not Started | 0% | 5 |
| **TOTAL** | | **63** | **Not Started** | **0%** | **40** |

---

## Phase 1: Design System Foundation

**Duration**: 4-5 days | **Story Points**: 8
**Assigned to**: ui-designer, frontend-developer
**Status**: Not Started
**Goal**: Establish tokens, fonts, icons, and core styles

### Tasks

- [ ] **DS-001** - Update Tailwind Config (3 SP)
  - Add custom colors, fonts (Poppins/Quicksand/Spline Sans), spacing tokens, shadow variants
  - Primary color: Coral #E57373
  - Files: `/apps/web/tailwind.config.ts`
  - Acceptance: All tokens configured, fonts loaded, no console errors

- [ ] **DS-002** - Global CSS & Animations (2 SP)
  - Create globals.css with fade-in, slide-up, scale animations
  - CSS variables for semantic colors
  - Safe-area support
  - Files: `/apps/web/app/globals.css`
  - Acceptance: Animations smooth, Material Symbols imported, safe-area vars applied

- [ ] **DS-003** - Material Symbols Icons (2 SP)
  - Add Material Symbols Outlined font
  - Create icon mapping component
  - Files: `/apps/web/components/ui/icon.tsx`
  - Acceptance: Icons render correctly in all contexts

- [ ] **DS-004** - Dark Mode Setup (1 SP)
  - Configure Tailwind dark: classes
  - Add theme toggle hook
  - Files: `/apps/web/hooks/useDarkMode.ts`
  - Acceptance: Dark mode toggles correctly, localStorage persists

### Success Criteria

- [ ] `tailwind.config.ts` updated with all design tokens
- [ ] Material Symbols Outlined font loads correctly
- [ ] All semantic color tokens defined and tested
- [ ] Dark mode toggle works across all tokens
- [ ] No console errors or warnings

### Key Files to Create/Modify

- `/apps/web/tailwind.config.ts` — Design tokens
- `/apps/web/app/globals.css` — Global styles, animations, Material Symbols
- `/apps/web/components/ui/icon.tsx` — Icon component
- `/apps/web/hooks/useDarkMode.ts` — Dark mode state management
- `/apps/web/lib/cn.ts` — Class merging utility (if not exists)

### Dependencies

- None (foundation phase)

---

## Phase 2: Layout & Navigation

**Duration**: 3-4 days | **Story Points**: 8
**Assigned to**: ui-engineer-enhanced, frontend-developer
**Status**: Not Started
**Goal**: Build fixed sidebar, header, and main layout scaffold

### Tasks

- [ ] **LN-001** - AppLayout Component (2 SP)
  - Create fixed layout with Sidebar + Header + Main sections
  - Handle safe-areas for notched devices
  - Files: `/apps/web/components/layout/AppLayout.tsx`
  - Acceptance: Correct ml-offset, sidebar fixed on desktop, safe-areas respected

- [ ] **LN-002** - Sidebar Navigation (2 SP)
  - Build glassmorphic sidebar with nav links, avatar, FAB button
  - Tooltips on hover
  - Files: `/apps/web/components/layout/Sidebar.tsx`
  - Acceptance: w-20 md:w-24, active states work, avatar & FAB render, tooltips appear

- [ ] **LN-003** - Mobile Bottom Nav (2 SP)
  - Create fallback bottom nav for mobile (sm: breakpoint)
  - Show/hide based on route
  - Files: `/apps/web/components/layout/MobileNav.tsx`
  - Acceptance: Appears on mobile, links active correctly, no content overlap

- [ ] **LN-004** - Header Component (2 SP)
  - Sticky header with breadcrumbs, search, action buttons
  - Responsive collapse
  - Files: `/apps/web/components/layout/Header.tsx`
  - Acceptance: Header sticky, breadcrumbs navigate, search works, actions aligned

### Success Criteria

- [ ] AppLayout renders with correct ml-offset
- [ ] Sidebar glassmorphism visible; active states work
- [ ] Header sticky; breadcrumbs navigate
- [ ] Mobile nav appears on sm: breakpoint
- [ ] Safe-areas respected on notched devices
- [ ] Responsive grid layouts pass Lighthouse audit

### Key Files to Create/Modify

- `/apps/web/components/layout/AppLayout.tsx`
- `/apps/web/components/layout/Sidebar.tsx`
- `/apps/web/components/layout/Header.tsx`
- `/apps/web/components/layout/MobileNav.tsx`

### Dependencies

- Phase 1 (Design System tokens)

---

## Phase 3: UI Component Library

**Duration**: 5-6 days | **Story Points**: 12
**Assigned to**: ui-engineer-enhanced
**Status**: Not Started
**Goal**: Build all 30+ primitive components (buttons, cards, inputs, badges, modals, etc.)

### Tasks

- [ ] **UC-001** - Button Components (2 SP)
  - Primary, secondary, ghost, outline variants
  - 4 sizes with 44px min touch target
  - Disabled/loading states
  - Files: `/apps/web/components/ui/button.tsx`
  - Acceptance: All variants render, sizes match spec, loading spinner shows

- [ ] **UC-002** - Card Components (1 SP)
  - Default, elevated, outline variants
  - Supports actions/footer
  - Files: `/apps/web/components/ui/card.tsx`
  - Acceptance: Cards render with shadows, hover effects work, responsive padding

- [ ] **UC-003** - Input & Form Fields (1 SP)
  - Text input, email, password, number
  - Label + error states
  - Files: `/apps/web/components/ui/input.tsx`
  - Acceptance: Form fields validated, error messages show, disabled state works

- [ ] **UC-004** - Badge & Pill Components (1 SP)
  - Status badges (Idea/To Buy/Purchased/Gifted)
  - Category pills, custom colors
  - Files: `/apps/web/components/ui/badge.tsx`
  - Acceptance: All 4 status colors render, icons show, inline with text

- [ ] **UC-005** - Avatar & Stack (1 SP)
  - Single avatar, stacked avatars with -space-x
  - Hover reveal animation
  - Files: `/apps/web/components/ui/avatar.tsx`
  - Acceptance: Avatar renders image, stack layers correctly, hover animation smooth

- [ ] **UC-006** - Modal Component (2 SP)
  - Base modal + header/body/footer structure
  - Close button, overlay dismiss
  - Files: `/apps/web/components/ui/modal.tsx`
  - Acceptance: Modal mounts/unmounts, outside click closes, backdrop blur works

- [ ] **UC-007** - Stats Card Component (1 SP)
  - Large number + label + hover effect
  - 3-column grid layout
  - Files: `/apps/web/components/ui/stats-card.tsx`
  - Acceptance: Stats render with correct sizing, hover lift effect, grid responsive

- [ ] **UC-008** - Timeline Component (1 SP)
  - Timeline dots with connectors
  - Activity items with avatars/text
  - Files: `/apps/web/components/ui/timeline.tsx`
  - Acceptance: Timeline renders with vertical line, dots positioned correctly

- [ ] **UC-009** - Table Component (2 SP)
  - Sticky header, row hover, pagination support
  - Action menu
  - Files: `/apps/web/components/ui/table.tsx`
  - Acceptance: Table renders, header sticky on scroll, hover rows, pagination works

- [ ] **UC-010** - Filter & Search Components (1 SP)
  - SearchBar, FilterBar with multi-select
  - Clear all button
  - Files: `/apps/web/components/ui/search-bar.tsx`
  - Acceptance: Search filters list, filter dropdowns work, clear all resets

### Success Criteria

- [ ] All 12 primitive components built and exported
- [ ] Each component has 2-3 variants and states
- [ ] Components responsive to sm/md/lg breakpoints
- [ ] 44px minimum touch targets on all interactive elements
- [ ] Zero axe accessibility violations

### Key Files to Create/Modify

- `/apps/web/components/ui/button.tsx`
- `/apps/web/components/ui/card.tsx`
- `/apps/web/components/ui/input.tsx`
- `/apps/web/components/ui/badge.tsx`
- `/apps/web/components/ui/avatar.tsx`
- `/apps/web/components/ui/modal.tsx`
- `/apps/web/components/ui/stats-card.tsx`
- `/apps/web/components/ui/timeline.tsx`
- `/apps/web/components/ui/table.tsx`
- `/apps/web/components/ui/search-bar.tsx`

### Dependencies

- Phase 1 (Design System tokens)
- Phase 2 (Layout foundation)

---

## Phase 4: Page Implementations

**Duration**: 5-6 days | **Story Points**: 14
**Assigned to**: ui-engineer-enhanced
**Status**: Not Started
**Goal**: Build 5 pages with proper layouts and state management

### Tasks

- [ ] **PG-001** - Login Page (2 SP)
  - Split-screen design (left: illustration, right: glassmorphic form)
  - Form validation and error handling
  - Files: `/apps/web/app/(auth)/login/page.tsx`
  - Acceptance: Form validates, login button submits, error messages show

- [ ] **PG-002** - Dashboard Page (3 SP)
  - 5/7 grid split: left (stats, CTA button, idea inbox), right (activity timeline)
  - Stats cards display counts
  - Idea inbox shows items, timeline scrolls
  - Files: `/apps/web/app/dashboard/page.tsx`
  - Acceptance: Grid responsive, all content displays, state management works

- [ ] **PG-003** - Lists Page (2 SP)
  - Left sidebar (filters), right main (list cards grid)
  - Occasion grouping
  - Files: `/apps/web/app/lists/page.tsx`
  - Acceptance: List cards render, filter sidebar works, responsive grid, load state handled

- [ ] **PG-004** - List Details - Kanban View (3 SP)
  - 4-column board (Idea/To Buy/Purchased/Gifted)
  - Drag-drop between columns
  - Card click opens modal
  - Files: `/apps/web/app/lists/[id]/page.tsx`, `/apps/web/components/features/KanbanBoard.tsx`
  - Acceptance: Kanban renders 4 columns, cards display, drag-drop queues updates

- [ ] **PG-005** - List Details - Table View (2 SP)
  - Full table with columns (Gift, Recipient, Status, Price, Category, Added By, Actions)
  - Sticky header, row click opens detail modal
  - Files: `/apps/web/app/lists/[id]/page.tsx` (table view toggle)
  - Acceptance: Table renders all columns, header sticky, row click opens modal

- [ ] **PG-006** - Recipients Page (2 SP)
  - Filter tabs (Household/Family/Friends)
  - Occasion horizontal scroll
  - Recipient grid with modals
  - Files: `/apps/web/app/recipients/page.tsx`
  - Acceptance: Tabs filter correctly, occasions scrollable, cards clickable, modal opens

### Success Criteria

- [ ] 5 pages implemented with proper layouts
- [ ] Layouts match inspiration design (visual regression test)
- [ ] State management works (page-level state)
- [ ] Forms validate and submit
- [ ] Mobile responsive (max 2 column layouts)

### Key Files to Create/Modify

- `/apps/web/app/(auth)/login/page.tsx`
- `/apps/web/app/dashboard/page.tsx`
- `/apps/web/app/lists/page.tsx`
- `/apps/web/app/lists/[id]/page.tsx`
- `/apps/web/app/recipients/page.tsx`
- `/apps/web/components/pages/` (subcomponents per page)

### Dependencies

- Phase 1-3 (Design System, Layout, UI Components)

---

## Phase 5: Feature Components & Backend Integration

**Duration**: 5-6 days | **Story Points**: 13
**Assigned to**: frontend-developer, ui-engineer-enhanced
**Status**: Not Started
**Goal**: Wire components to FastAPI backend; add WebSocket real-time

### Tasks

- [ ] **FC-001** - React Query Hooks (2 SP)
  - useGifts, useLists, useRecipients, useOccasions with cache keys
  - Proper cache invalidation
  - Suspense ready
  - Files: `/apps/web/hooks/useGifts.ts`, `useLists.ts`, `useRecipients.ts`, `useOccasions.ts`
  - Acceptance: Hooks query API correctly, caching works, refetch on demand

- [ ] **FC-002** - WebSocket Integration (2 SP)
  - useWebSocket hook; subscribe to topics (gift-list:id, recipients:id)
  - Invalidate React Query on events
  - Fallback to poll if WS down
  - Files: `/apps/web/hooks/useWebSocket.ts`
  - Acceptance: WebSocket connects, subscriptions work, RQ invalidates on event

- [ ] **FC-003** - Gift Details Modal (2 SP)
  - Full modal with tabs (Overview, Linked Entities, History)
  - Edit/delete buttons, smart suggestions sidebar
  - Files: `/apps/web/components/features/GiftDetailsModal.tsx`
  - Acceptance: Modal renders, tabs switch, edit button opens form, delete confirms

- [ ] **FC-004** - Gift Form Component (2 SP)
  - Create/edit form with image upload, recipient select, price, category, links
  - Form validation, image preview
  - Files: `/apps/web/components/features/GiftForm.tsx`
  - Acceptance: Form validates input, image preview works, dropdown selects, submit fires mutation

- [ ] **FC-005** - Kanban Drag-Drop (2 SP)
  - Integrate react-beautiful-dnd (or native Draggable API)
  - Update status on drop, optimistic update
  - Files: `/apps/web/components/features/KanbanBoard.tsx`
  - Acceptance: Cards draggable, columns accept drops, status updates via mutation

- [ ] **FC-006** - Recipients Modals (2 SP)
  - View/edit recipient details
  - Size preferences, interests, birthday/anniversary
  - Files: `/apps/web/components/features/RecipientDetailsModal.tsx`
  - Acceptance: Modal displays info, edit form validates, save updates backend

- [ ] **FC-007** - List Management (1 SP)
  - Create new list, edit occasion/date
  - Archive/delete with confirm dialog
  - Files: Updated `/apps/web/lib/api.ts`
  - Acceptance: Create form works, date picker functional, archive confirms

### Success Criteria

- [ ] React Query hooks fetch from API endpoints
- [ ] WebSocket connections establish and update cache
- [ ] Drag-drop moves items and updates status
- [ ] Modals open/close with proper form handling
- [ ] Optimistic updates rollback on error
- [ ] 3G throttle time <4s

### Key Files to Create/Modify

- `/apps/web/hooks/useGifts.ts`
- `/apps/web/hooks/useLists.ts`
- `/apps/web/hooks/useRecipients.ts`
- `/apps/web/hooks/useOccasions.ts`
- `/apps/web/hooks/useWebSocket.ts`
- `/apps/web/components/features/GiftDetailsModal.tsx`
- `/apps/web/components/features/GiftForm.tsx`
- `/apps/web/components/features/KanbanBoard.tsx`
- `/apps/web/components/features/RecipientDetailsModal.tsx`
- `/apps/web/lib/api.ts`

### Dependencies

- Phase 4 (Pages)
- Existing FastAPI backend

---

## Phase 6: Polish & Testing

**Duration**: 3-4 days | **Story Points**: 8
**Assigned to**: frontend-developer, web-accessibility-checker, react-performance-optimizer
**Status**: Not Started
**Goal**: Animations, accessibility, performance, E2E testing

### Tasks

- [ ] **PT-001** - Add Animations & Transitions (2 SP)
  - Page fade-ins, card slide-ups, modal scale, button ripple effects
  - Respect prefers-reduced-motion
  - Files: `/apps/web/app/globals.css`, component keyframes
  - Acceptance: All animations smooth (60fps), no jank, accessibility OK

- [ ] **PT-002** - Responsive Testing (1 SP)
  - Test all breakpoints (xs:375, sm:640, md:768, lg:1024)
  - Safe-area edge cases on notched devices
  - Files: Test files in `/__tests__/responsive.spec.ts`
  - Acceptance: All pages responsive, safe-areas work, bottom nav correct on mobile

- [ ] **PT-003** - Accessibility Audit (2 SP)
  - axe/WCAG AA checks; color contrast, keyboard nav, ARIA labels
  - Focus management testing
  - Files: Audit report, component updates
  - Acceptance: axe reports 0 errors, all components keyboard navigable, 4.5:1 color contrast

- [ ] **PT-004** - Performance Optimization (2 SP)
  - React Query cache tuning, code splitting, image optimization
  - Network throttle testing
  - Files: `/apps/web/next.config.js`, hook optimizations
  - Acceptance: FCP <2.5s, LCP <4s, CLS <0.1, no wasteful re-renders

- [ ] **PT-005** - E2E Test Suite (1 SP)
  - Playwright tests: login flow, create gift, drag-drop, real-time update, mobile navigation
  - 10+ critical path tests
  - Files: `/apps/web/__tests__/e2e/`, `.playwrightrc.ts`
  - Acceptance: 10+ critical E2E tests pass, mobile tests pass on emulated iPhone 14

### Success Criteria

- [ ] All animations 60fps, no jank
- [ ] axe reports 0 violations; WCAG AA pass
- [ ] Keyboard navigation works on all pages
- [ ] 10+ critical E2E tests passing
- [ ] Lighthouse scores: 90+ Performance, 95+ Accessibility
- [ ] All browser/device combinations tested

### Key Files to Create/Modify

- `/apps/web/app/globals.css` — Animation keyframes
- `/apps/web/__tests__/e2e/` — E2E test files
- `/apps/web/__tests__/responsive.spec.ts` — Responsive test
- `/apps/web/.playwrightrc.ts` — Playwright config
- Hook files — Performance optimizations

### Dependencies

- Phase 1-5 (All prior work complete)

---

## Progress Summary

### Completion Metrics

| Phase | Tasks | Completed | In Progress | Remaining | %Complete |
|-------|-------|-----------|-------------|-----------|-----------|
| Phase 1 | 4 | 0 | 0 | 4 | 0% |
| Phase 2 | 4 | 0 | 0 | 4 | 0% |
| Phase 3 | 10 | 0 | 0 | 10 | 0% |
| Phase 4 | 6 | 0 | 0 | 6 | 0% |
| Phase 5 | 7 | 0 | 0 | 7 | 0% |
| Phase 6 | 5 | 0 | 0 | 5 | 0% |
| **TOTAL** | **40** | **0** | **0** | **40** | **0%** |

### Story Point Distribution

- Phase 1: 8 SP (14%)
- Phase 2: 8 SP (13%)
- Phase 3: 12 SP (19%)
- Phase 4: 14 SP (22%)
- Phase 5: 13 SP (21%)
- Phase 6: 8 SP (13%)
- **Total**: 63 SP

---

## Dependencies & Sequencing

```
Phase 1: Design System Foundation
    ↓
Phase 2: Layout & Navigation (depends on Phase 1)
    ↓
Phase 3: UI Component Library (depends on Phases 1-2)
    ↓
Phase 4: Page Implementations (depends on Phases 1-3)
    ↓
Phase 5: Integration (depends on Phase 4 + FastAPI backend)
    ↓
Phase 6: Polish & Testing (depends on all prior phases)
```

**Parallel Opportunities**:
- Phase 2 & 3 can overlap (layout doesn't block component building)
- Phase 4 & 5 can partially overlap (pages can wire to stubbed API, then refine)

---

## Quality Gates

### Before Phase 2 Starts

- [ ] All Phase 1 tasks completed
- [ ] `tailwind.config.ts` has all tokens
- [ ] Material Symbols loads in all environments
- [ ] Dark mode toggle works end-to-end
- [ ] No console errors or warnings

### Before Phase 3 Starts

- [ ] AppLayout renders correctly
- [ ] Sidebar & Header sticky on desktop
- [ ] Mobile nav appears on sm: breakpoint
- [ ] Safe-area handling tested on notched devices

### Before Phase 4 Starts

- [ ] All 12 UI components built and exported
- [ ] Component Storybook stories written
- [ ] All components responsive (xs→lg)
- [ ] axe accessibility checks pass

### Before Phase 5 Starts

- [ ] All 5 pages render with correct layouts
- [ ] Pages match inspiration design screenshots
- [ ] Form validation works
- [ ] State management initialized

### Before Phase 6 Starts

- [ ] All API integrations complete
- [ ] WebSocket connections work
- [ ] Drag-drop fully functional
- [ ] Modals open/close correctly

### Final Gate (Phase 6 Complete)

- [ ] axe reports 0 violations
- [ ] All animations 60fps
- [ ] Lighthouse: 90+ Performance, 95+ Accessibility
- [ ] 10+ E2E tests passing
- [ ] Mobile testing on physical devices
- [ ] 3G throttle: <2.5s FCP, <4s LCP

---

## Blockers & Risks

### Current Blockers

None — ready to start Phase 1

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| WebSocket connection drops | Medium | High | Fallback polling every 10s; reconnect with exponential backoff |
| Drag-drop library conflicts | Low | Medium | Use native Draggable API instead of 3rd party if issues arise |
| Mobile safe-area edge cases | Medium | Low | Test on physical iPhone 14 Pro; use env() CSS vars |
| Performance regression | Medium | High | Monitor React DevTools; measure LCP/FCP at each phase |
| Accessibility violations | Low | High | Run axe at end of each phase; test keyboard nav daily |

---

## Related Documentation

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **Inspiration Project**: `inspiration/family-gifting-v2/`
- **Design Reference**: `docs/designs/asthetic-v1.md`
- **Architecture**: `CLAUDE.md` (project instructions)

---

## Status History

| Date | Status | Completed | In Progress | Notes |
|------|--------|-----------|-------------|-------|
| 2025-11-30 | Not Started | 0% | — | Initial progress file created; ready for Phase 1 |

---

**Last Updated**: 2025-11-30
**Maintained By**: Implementation Team
**Review Frequency**: Weekly (or after phase completion)
