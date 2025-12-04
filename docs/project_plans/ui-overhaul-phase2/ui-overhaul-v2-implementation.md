# UI Overhaul V2 — Implementation Plan

**Status**: Ready for Sprint Planning
**Complexity**: Large (L) | **Track**: Full
**Total Effort**: ~55 story points
**Timeline**: 5-6 weeks
**Last Updated**: 2025-11-30

---

## Executive Summary

This plan replaces UI Overhaul Phase 2 with a complete redesign based on the inspiration project at `inspiration/family-gifting-v2/`. The new design introduces:

- **Modern Glass-morphism UI** with soft shadows and rounded corners (32px)
- **Fixed Sidebar Navigation** (w-20 md:w-24) with glassmorphic styling
- **4-Column Kanban Board** for gift management (Idea → To Buy → Purchased → Gifted)
- **Rich Dashboard** with stats cards, idea inbox, and real-time activity timeline
- **Material Symbols Outlined Icons** with updated color palette (Primary: Coral #E57373)
- **Full Backend Integration** with React Query + WebSocket for real-time updates
- **Mobile-First Responsive** design with bottom nav fallback

**Success Criteria**:
- All 6 pages match inspiration design pixel-perfectly
- Kanban board fully functional with drag-drop support
- Real-time updates via WebSocket for all components
- React Query caching optimized with proper invalidation
- 100% accessibility score (WCAG AA)
- 60+ FCP (First Contentful Paint) on mobile

---

## Architecture Overview

### Design System Foundation
- **Primary Color**: Coral (#E57373) with variants (primary-dark: #D32F2F)
- **Background**: Creamy off-white (#FBF9F6) / Dark mode support
- **Fonts**: Poppins (display), Quicksand (body), Spline Sans (kanban)
- **Border Radius**: Standard 32px (rounded-3xl), 24px (rounded-2xl), 16px (rounded-xl)
- **Shadows**: Soft layered shadows with colored variants (shadow-primary/30)
- **Icons**: Material Symbols Outlined (material-symbols-outlined class)

### Layout Stack
```
AppLayout (fixed h-screen)
├── Sidebar (fixed w-20 md:w-24, glassmorphism)
├── Header (sticky, breadcrumbs + actions)
└── Main (ml-20 md:ml-24, overflow-y-auto)
    └── MaxWidth 1600px container
```

### Status Colors
| Status | Light | Dark | Icon |
|--------|-------|------|------|
| Idea | bg-yellow-100 text-yellow-800 | - | lightbulb |
| To Buy | bg-red-100 text-red-800 | - | shopping_cart |
| Purchased | bg-teal-100/green-100 text-teal-800 | - | check_circle |
| Gifted | bg-purple-100 text-purple-800 | - | volunteer_activism |

---

## Phase Breakdown

### Phase 1: Design System Foundation
**Duration**: 4-5 days | **Story Points**: 8
**Goal**: Establish tokens, fonts, icons, and core styles

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| DS-001 | Update Tailwind Config | Add custom colors, fonts (Poppins/Quicksand/Spline Sans), spacing tokens, shadow variants | `tailwind.config.ts` has all tokens; Poppins/Quicksand loaded; primary color is E57373 | 3 | ui-designer |
| DS-002 | Global CSS & Animations | Create globals.css with fade-in, slide-up, scale animations; CSS vars for semantic colors; safe-area support | `globals.css` imports Material Symbols; fade-in/slide-up animations work; safe-area vars applied | 2 | frontend-developer |
| DS-003 | Material Symbols Icons | Add Material Symbols Outlined font; create icon mapping component | Material Symbols render correctly; icon component works in all contexts | 2 | ui-engineer-enhanced |
| DS-004 | Dark Mode Setup | Configure Tailwind dark: classes; add theme toggle hook | Dark mode toggles correctly; all colors have dark variants; localStorage persists setting | 1 | frontend-developer |

**Key Files**:
- `/apps/web/tailwind.config.ts` (add theme.colors, theme.fontFamily, theme.extend.shadowing)
- `/apps/web/app/globals.css` (Material Symbols import, CSS animations)
- `/apps/web/lib/cn.ts` (utility function for class merging)
- `/apps/web/hooks/useDarkMode.ts` (dark mode state)

**Dependencies**: None
**Validation**: All colors display correctly; animations smooth; dark mode functional

---

### Phase 2: Layout & Navigation
**Duration**: 3-4 days | **Story Points**: 8
**Goal**: Build fixed sidebar, header, and main layout scaffold

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| LN-001 | AppLayout Component | Create fixed layout with Sidebar + Header + Main sections; handle safe-areas | Layout renders with correct ml-offset; sidebar fixed on desktop; safe-areas respected | 2 | ui-engineer-enhanced |
| LN-002 | Sidebar Navigation | Build glassmorphic sidebar with nav links, avatar, FAB button; tooltips on hover | Sidebar w-20 md:w-24; active state shows; avatar & FAB render; tooltips appear | 2 | ui-engineer-enhanced |
| LN-003 | Mobile Bottom Nav | Create fallback bottom nav for mobile (sm: breakpoint); show/hide based on route | Bottom nav appears on mobile; links active correctly; doesn't overlap content | 2 | frontend-developer |
| LN-004 | Header Component | Sticky header with breadcrumbs, search, action buttons; responsive collapse | Header sticky; breadcrumbs navigate; search input works; actions aligned right | 2 | ui-engineer-enhanced |

**Key Files**:
- `/apps/web/components/layout/AppLayout.tsx`
- `/apps/web/components/layout/Sidebar.tsx`
- `/apps/web/components/layout/Header.tsx`
- `/apps/web/components/layout/MobileNav.tsx`

**Dependencies**: Phase 1 (tokens)
**Validation**: Layout matches inspiration screenshot; safe-areas work; responsive

---

### Phase 3: UI Component Library
**Duration**: 5-6 days | **Story Points**: 12
**Goal**: Build all 30+ primitive components (buttons, cards, inputs, badges, modals, etc.)

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| UC-001 | Button Components | Primary, secondary, ghost, outline variants; 4 sizes; disabled/loading states | All variants render; sizes match spec; loading spinner shows; 44px min touch target | 2 | ui-engineer-enhanced |
| UC-002 | Card Components | Default, elevated, outline variants; supports actions/footer | Cards render with shadows; hover effects work; responsive padding | 1 | ui-engineer-enhanced |
| UC-003 | Input & Form Fields | Text input, email, password, number; label + error states | Form fields validated; error messages show; disabled state works | 1 | ui-engineer-enhanced |
| UC-004 | Badge & Pill Components | Status badges (Idea/To Buy/Purchased/Gifted), category pills, custom colors | All 4 status colors render; icons show; inline with text | 1 | ui-engineer-enhanced |
| UC-005 | Avatar & Stack | Single avatar, stacked avatars with -space-x, hover reveal animation | Avatar renders image; stack layers correctly; hover animation smooth | 1 | ui-engineer-enhanced |
| UC-006 | Modal Component | Base modal + header/body/footer structure; close button; overlay dismiss | Modal mounts/unmounts; outside click closes; backdrop blur works | 2 | ui-engineer-enhanced |
| UC-007 | Stats Card Component | Large number + label + hover effect; 3-column grid layout | Stats render with correct sizing; hover lift effect; grid responsive | 1 | ui-engineer-enhanced |
| UC-008 | Timeline Component | Timeline dots with connectors, activity items with avatars/text | Timeline renders with vertical line; dots positioned correctly | 1 | ui-engineer-enhanced |
| UC-009 | Table Component | Sticky header, row hover, pagination support, action menu | Table renders; header sticky on scroll; hover rows; pagination works | 2 | ui-engineer-enhanced |
| UC-010 | Filter & Search Components | SearchBar, FilterBar with multi-select, clear all button | Search filters list; filter dropdowns work; clear all resets | 1 | ui-engineer-enhanced |

**Key Files**:
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

**Dependencies**: Phase 1 (tokens), Phase 2 (layout)
**Validation**: All components render correctly; responsive; accessible (WCAG AA)

---

### Phase 4: Page Implementations
**Duration**: 5-6 days | **Story Points**: 14
**Goal**: Build 5 pages with proper layouts and state management

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| PG-001 | Login Page | Split-screen design (left: illustration, right: glassmorphic form) | Form validates; login button submits; error messages show; layout matches inspiration | 2 | ui-engineer-enhanced |
| PG-002 | Dashboard Page | 5/7 grid split: left (stats, CTA button, idea inbox), right (activity timeline) | Grid responsive; stats cards display counts; idea inbox shows items; timeline scrolls | 3 | ui-engineer-enhanced |
| PG-003 | Lists Page | Left sidebar (filters), right main (list cards grid); occasion grouping | List cards render; filter sidebar works; responsive grid; load state handled | 2 | ui-engineer-enhanced |
| PG-004 | List Details - Kanban | 4-column board (Idea/To Buy/Purchased/Gifted); drag-drop between columns; card click opens modal | Kanban renders 4 columns; cards display; drag-drop queues updates; mobile scroll works | 3 | ui-engineer-enhanced |
| PG-005 | List Details - Table View | Full table with columns (Gift, Recipient, Status, Price, Category, Added By, Actions) | Table renders all columns; sticky header; row click opens detail modal; responsive scroll | 2 | ui-engineer-enhanced |
| PG-006 | Recipients Page | Filter tabs (Household/Family/Friends), occasion horizontal scroll, recipient grid with modals | Tabs filter correctly; occasions scrollable; recipient cards clickable; modal opens | 2 | ui-engineer-enhanced |

**Key Files**:
- `/apps/web/app/(auth)/login/page.tsx`
- `/apps/web/app/dashboard/page.tsx`
- `/apps/web/app/lists/page.tsx`
- `/apps/web/app/lists/[id]/page.tsx`
- `/apps/web/app/recipients/page.tsx`
- `/apps/web/components/pages/` (subcomponents per page)

**Dependencies**: Phase 1-3 (tokens, layout, components)
**Validation**: Pages match inspiration design; layouts responsive; all states handled

---

### Phase 5: Feature Components & Backend Integration
**Duration**: 5-6 days | **Story Points**: 13
**Goal**: Wire components to FastAPI backend; add WebSocket real-time

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| FC-001 | React Query Hooks | useGifts, useLists, useRecipients, useOccasions with cache keys | Hooks query API correctly; caching works; refetch on demand; suspense ready | 2 | frontend-developer |
| FC-002 | WebSocket Integration | useWebSocket hook; subscribe to topics (gift-list:id, recipients:id); invalidate RQ on events | WebSocket connects; subscriptions work; RQ invalidates on event; fallback to poll | 2 | frontend-developer |
| FC-003 | Gift Details Modal | Full modal with tabs (Overview, Linked Entities, History); edit/delete buttons; smart suggestions sidebar | Modal renders; tabs switch; edit button opens form; delete confirms | 2 | ui-engineer-enhanced |
| FC-004 | Gift Form Component | Create/edit form with image upload, recipient select, price, category, links | Form validates input; image preview works; dropdown selects recipient; submit fires mutation | 2 | frontend-developer |
| FC-005 | Kanban Drag-Drop | Integrate react-beautiful-dnd (or native Draggable API); update status on drop | Cards draggable; columns accept drops; status updates via mutation; optimistic update | 2 | frontend-developer |
| FC-006 | Recipients Modals | View/edit recipient details; size preferences, interests, birthday/anniversary | Modal displays recipient info; edit form validates; save updates backend | 2 | ui-engineer-enhanced |
| FC-007 | List Management | Create new list; edit occasion/date; archive/delete with confirm dialog | Create form works; date picker functional; archive confirms; list updates in UI | 1 | frontend-developer |

**Key Files**:
- `/apps/web/hooks/useGifts.ts`, `useLists.ts`, `useRecipients.ts`, `useOccasions.ts`
- `/apps/web/hooks/useWebSocket.ts`
- `/apps/web/components/features/GiftDetailsModal.tsx`
- `/apps/web/components/features/GiftForm.tsx`
- `/apps/web/components/features/KanbanBoard.tsx`
- `/apps/web/lib/api.ts` (updated fetch wrapper)

**Dependencies**: Phase 4 (pages), existing FastAPI backend
**Validation**: API calls work; real-time updates flow; optimistic updates rollback on error

---

### Phase 6: Polish & Testing
**Duration**: 3-4 days | **Story Points**: 8
**Goal**: Animations, accessibility, performance, E2E testing

| ID | Task | Description | Acceptance Criteria | SP | Agent |
|-----|------|-------------|-------------------|-----|-------|
| PT-001 | Add Animations & Transitions | Page fade-ins, card slide-ups, modal scale, button ripple effects | All animations smooth (60fps); duration 300-400ms; no jank; accessibility OK (prefers-reduced-motion) | 2 | frontend-developer |
| PT-002 | Responsive Testing | Test all breakpoints (xs:375, sm:640, md:768, lg:1024); safe-area edge cases | All pages responsive; safe-areas work on notched devices; bottom nav correct on mobile | 1 | ui-engineer-enhanced |
| PT-003 | Accessibility Audit | axe/WCAG AA checks; color contrast, keyboard nav, ARIA labels, focus management | axe reports 0 errors; all components keyboard navigable; 4.5:1 color contrast | 2 | web-accessibility-checker |
| PT-004 | Performance Optimization | React Query cache tuning, code splitting, image optimization, network throttle testing | FCP <2.5s; LCP <4s; CLS <0.1; React devtools shows no wasteful re-renders | 2 | react-performance-optimizer |
| PT-005 | E2E Test Suite | Playwright tests: login flow, create gift, drag-drop, real-time update, mobile navigation | 10+ critical path tests pass; mobile tests pass on emulated iPhone 14 | 1 | frontend-developer |

**Key Files**:
- `/apps/web/app/globals.css` (animation keyframes)
- `/apps/web/__tests__/` (E2E tests)
- `/apps/web/.playwrightrc.ts` (Playwright config)

**Dependencies**: Phase 1-5 (all prior work)
**Validation**: No accessibility violations; animations smooth; E2E tests pass

---

## Task Summary by Phase

| Phase | Duration | SP | Key Deliverables |
|-------|----------|-----|-------------------|
| 1: Design System | 4-5 days | 8 | Tailwind config, globals.css, icon font, dark mode |
| 2: Layout & Nav | 3-4 days | 8 | AppLayout, Sidebar, Header, Mobile nav |
| 3: UI Components | 5-6 days | 12 | 30+ components (buttons, cards, inputs, modals, etc.) |
| 4: Pages | 5-6 days | 14 | 5 fully designed pages with state |
| 5: Integration | 5-6 days | 13 | React Query, WebSocket, backend wiring, drag-drop |
| 6: Polish | 3-4 days | 8 | Animations, a11y, performance, E2E tests |
| **TOTAL** | **5-6 weeks** | **~55** | **Full UI overhaul complete** |

---

## Component Inventory

**Layout (4)**:
- AppLayout, Sidebar, Header, MobileNav

**UI Primitives (12)**:
- Button (4 variants), Card (3 variants), Input, Badge, Avatar, Modal, Stats Card, Timeline, Table, SearchBar

**Feature Components (8)**:
- GiftDetailsModal, GiftForm, KanbanBoard, KanbanColumn, RecipientDetailsModal, RecipientForm, ListCard, OccasionCard

**Pages (5)**:
- Login, Dashboard, Lists, ListDetails (Kanban + Table), Recipients

**Total**: ~30 components

---

## Subagent Assignments

| Agent | Primary Responsibilities | Phases |
|-------|------------------------|--------|
| **ui-designer** | Design tokens, color system, icon mapping | Phase 1 |
| **ui-engineer-enhanced** | Layout, navigation, UI components, pages, feature components | Phases 2-5 |
| **frontend-developer** | Animations, responsive, hooks, integration, testing | Phases 1-6 |
| **web-accessibility-checker** | WCAG AA audit, keyboard nav, ARIA labels | Phase 6 |
| **react-performance-optimizer** | Cache tuning, code splitting, network optimization | Phase 6 |

---

## Dependencies & Sequencing

```
Phase 1: Design System
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

**Parallel Work**:
- Phase 2 & 3 can overlap (layout doesn't block component building)
- Phase 4 & 5 partially overlap (pages can wire to stubbed API calls, then refine)

---

## Quality Gates

### Phase 1 Completion
- [ ] `tailwind.config.ts` updated with all tokens
- [ ] Material Symbols Outlined font loads correctly
- [ ] All semantic color tokens defined and applied
- [ ] Dark mode toggle works across all tokens
- [ ] No console errors or warnings

### Phase 2 Completion
- [ ] AppLayout renders with correct ml-offset
- [ ] Sidebar glassmorphism visible; active states work
- [ ] Header sticky; breadcrumbs navigate
- [ ] Mobile nav appears on sm: breakpoint
- [ ] Safe-areas respected on notched devices
- [ ] Responsive grid layouts pass Lighthouse audit

### Phase 3 Completion
- [ ] All 12 primitive components built and exported
- [ ] Each component has 2-3 variants and states
- [ ] Components responsive to sm/md/lg breakpoints
- [ ] 44px minimum touch targets on all interactive elements
- [ ] Zero axe accessibility violations

### Phase 4 Completion
- [ ] 5 pages implemented with proper layouts
- [ ] Layouts match inspiration design (visual regression test)
- [ ] State management works (page-level state)
- [ ] Forms validate and submit
- [ ] Mobile responsive (max 2 column layouts)

### Phase 5 Completion
- [ ] React Query hooks fetch from API endpoints
- [ ] WebSocket connections establish and update cache
- [ ] Drag-drop moves items and updates status
- [ ] Modals open/close with proper form handling
- [ ] Optimistic updates rollback on error
- [ ] 3G throttle time <4s

### Phase 6 Completion
- [ ] All animations 60fps, no jank
- [ ] axe reports 0 violations; WCAG AA pass
- [ ] Keyboard navigation works on all pages
- [ ] 10+ critical E2E tests pass
- [ ] Lighthouse scores: 90+ Performance, 95+ Accessibility
- [ ] All browser/device combinations tested

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| WebSocket connection drops | Medium | High | Fallback polling every 10s; reconnect with exponential backoff |
| Drag-drop library conflicts | Low | Medium | Use native Draggable API instead of 3rd party if issues arise |
| Mobile safe-area edge cases | Medium | Low | Test on physical iPhone 14 Pro; use env() CSS vars |
| Performance regression | Medium | High | Monitor React DevTools; measure LCP/FCP at each phase |
| Accessibility violations | Low | High | Run axe at end of each phase; test keyboard nav daily |

---

## File Structure

```
/apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                    # PG-001
│   ├── dashboard/
│   │   └── page.tsx                        # PG-002
│   ├── lists/
│   │   ├── page.tsx                        # PG-003
│   │   └── [id]/
│   │       └── page.tsx                    # PG-004, PG-005
│   ├── recipients/
│   │   └── page.tsx                        # PG-006
│   ├── layout.tsx
│   └── globals.css                         # DS-002
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx                   # LN-001
│   │   ├── Sidebar.tsx                     # LN-002
│   │   ├── Header.tsx                      # LN-004
│   │   └── MobileNav.tsx                   # LN-003
│   ├── ui/
│   │   ├── button.tsx                      # UC-001
│   │   ├── card.tsx                        # UC-002
│   │   ├── input.tsx                       # UC-003
│   │   ├── badge.tsx                       # UC-004
│   │   ├── avatar.tsx                      # UC-005
│   │   ├── modal.tsx                       # UC-006
│   │   ├── stats-card.tsx                  # UC-007
│   │   ├── timeline.tsx                    # UC-008
│   │   ├── table.tsx                       # UC-009
│   │   └── search-bar.tsx                  # UC-010
│   └── features/
│       ├── GiftDetailsModal.tsx             # FC-003
│       ├── GiftForm.tsx                     # FC-004
│       ├── KanbanBoard.tsx                  # FC-005
│       ├── RecipientDetailsModal.tsx        # FC-006
│       └── ListCard.tsx
├── hooks/
│   ├── useGifts.ts                         # FC-001
│   ├── useLists.ts                         # FC-001
│   ├── useRecipients.ts                    # FC-001
│   ├── useOccasions.ts                     # FC-001
│   ├── useWebSocket.ts                     # FC-002
│   └── useDarkMode.ts                      # DS-004
├── lib/
│   ├── api.ts                              # FC-001 (updated)
│   └── cn.ts
├── __tests__/
│   ├── e2e/
│   │   ├── login.spec.ts                   # PT-005
│   │   ├── gift-workflow.spec.ts           # PT-005
│   │   └── responsive.spec.ts              # PT-002
│   └── unit/
│       ├── components/
│       └── hooks/
├── tailwind.config.ts                      # DS-001
└── package.json
```

---

## Inspiration Project References

Key files to reference for design details:

- `inspiration/family-gifting-v2/components/Layout.tsx` — Fixed sidebar + main layout pattern
- `inspiration/family-gifting-v2/components/Sidebar.tsx` — Glassmorphic nav with Material Symbols
- `inspiration/family-gifting-v2/pages/Dashboard.tsx` — 5/7 grid, stats cards, idea inbox, timeline
- `inspiration/family-gifting-v2/pages/ListDetails.tsx` — Kanban board (4 columns) + table view toggle
- `inspiration/family-gifting-v2/types.ts` — Data model (GiftStatus, Gift, Recipient, GiftList)

---

## Next Steps

1. **Sprint Planning**: Assign Phase 1 tasks to ui-designer and frontend-developer
2. **Kickoff Phase 1**: Start with tailwind.config.ts and Material Symbols setup
3. **Daily Standups**: Review progress on design system foundation
4. **Gate Review**: Validate Phase 1 completion before Phase 2 begins
5. **Iterate**: Each phase has a quality gate; proceed only when all criteria met

---

## Success Metrics

- **Delivery**: All 6 phases complete within 5-6 weeks
- **Quality**: Zero accessibility violations; 90+ Lighthouse score
- **Performance**: <2.5s FCP, <4s LCP on 3G mobile
- **Testing**: 10+ E2E tests passing; all critical flows covered
- **Design Fidelity**: Pages match inspiration screenshots pixel-perfectly
- **Real-Time**: WebSocket events propagate to UI within 500ms

---

**Prepared by**: Implementation Planner Orchestrator
**Date**: 2025-11-30
**Version**: 1.0
