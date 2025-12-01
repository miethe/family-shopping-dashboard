# UI Overhaul V2 — Quick Start Guide

**Overview**: Complete redesign of Family Gifting Dashboard UI to match `inspiration/family-gifting-v2/`

**Total Effort**: ~55 story points across 6 phases
**Timeline**: 5-6 weeks
**Complexity**: Large (L)

---

## What's Changing?

### Visual Design
- **Primary Color**: Coral (#E57373) replaces Salmon (#E07A5F)
- **Background**: Creamy off-white (#FBF9F6)
- **Fonts**: Poppins (display), Quicksand (body), Spline Sans (kanban)
- **Layout**: Fixed sidebar (glassmorphism) + desktop, bottom nav on mobile
- **Icons**: Material Symbols Outlined (all icons)
- **Border Radius**: 32px standard (rounded-3xl), 24px (rounded-2xl)

### New Experiences
1. **Kanban Board**: 4-column (Idea → To Buy → Purchased → Gifted) with drag-drop
2. **Dashboard**: Redesigned with stats cards, idea inbox, activity timeline
3. **Recipients**: New filter tabs + occasion scroll + recipient modals
4. **Real-Time**: WebSocket push events + React Query caching
5. **Mobile**: Bottom nav on mobile; full responsive (xs:375 to xl:1280)

---

## Files to Reference

**Design Inspiration** (reference only):
- `inspiration/family-gifting-v2/components/Layout.tsx` — Layout pattern
- `inspiration/family-gifting-v2/components/Sidebar.tsx` — Navigation styling
- `inspiration/family-gifting-v2/pages/Dashboard.tsx` — Dashboard layout
- `inspiration/family-gifting-v2/pages/ListDetails.tsx` — Kanban + Table + Modal

**Implementation Plan** (this directory):
- `ui-overhaul-v2-implementation.md` — Full plan with phases & tasks
- `PHASE-DETAILS.md` — Code examples & implementation notes
- `IMPLEMENTATION-CHECKLIST.md` — Task tracking
- `QUICK-START.md` — This file

---

## 6-Phase Breakdown

### Phase 1: Design System (4-5 days, 8 SP)
**Lead**: ui-designer
- Update tailwind.config.ts (colors, fonts, shadows)
- Create globals.css (animations, Material Symbols)
- Build Icon component
- Setup dark mode hook

**Output**: All design tokens ready

### Phase 2: Layout & Navigation (3-4 days, 8 SP)
**Lead**: ui-engineer-enhanced
- Build AppLayout (fixed layout with sidebar offset)
- Build Sidebar (glassmorphic, w-20 md:w-24)
- Build Header (sticky breadcrumbs + actions)
- Build Mobile bottom nav (sm: breakpoint)

**Output**: Layout scaffold complete

### Phase 3: UI Components (5-6 days, 12 SP)
**Lead**: ui-engineer-enhanced
- Button, Card, Input, Badge, Avatar components
- Modal, Table, Timeline, Stats Card, SearchBar
- 30+ total components (primitives + composites)

**Output**: Component library ready

### Phase 4: Pages (5-6 days, 14 SP)
**Lead**: ui-engineer-enhanced
- Login page (split-screen)
- Dashboard (5/7 grid with timeline)
- Lists page (filter + grid)
- List Details (Kanban + Table views)
- Recipients (filters + occasions + modals)

**Output**: 5 fully designed pages

### Phase 5: Integration (5-6 days, 13 SP)
**Lead**: frontend-developer
- React Query hooks (useGifts, useLists, etc.)
- WebSocket hook (real-time updates)
- Gift form + modal
- Kanban drag-drop (update status)
- Recipients modals
- List create/edit forms

**Output**: Backend-wired, real-time functional

### Phase 6: Polish (3-4 days, 8 SP)
**Lead**: frontend-developer + web-accessibility-checker
- Add animations (fade-in, slide-up, scale)
- Responsive testing (all breakpoints)
- A11y audit (axe, color contrast, keyboard nav)
- Performance optimization (FCP <2.5s, LCP <4s)
- E2E tests (10+ critical flows)

**Output**: Production-ready, accessible, tested

---

## Component Inventory

**Layout (4)**: AppLayout, Sidebar, Header, MobileNav

**UI Primitives (12)**:
- Button (4 variants: primary, secondary, ghost, outline)
- Card (3 variants: default, elevated, outline)
- Input, Badge, Avatar, Modal, Stats Card, Timeline, Table, SearchBar

**Feature Components (8)**:
- GiftDetailsModal, GiftForm, KanbanBoard, RecipientDetailsModal, RecipientForm, ListCard, OccasionCard, GiftIdeaInbox

**Pages (5)**:
- Login, Dashboard, Lists, ListDetails (Kanban + Table), Recipients

**Total**: ~30 components across ~2000 LOC

---

## Key Technical Patterns

### React Query + WebSocket
```typescript
// Hook loads REST data, subscribes to WebSocket
export function useGifts(listId: string) {
  const query = useQuery({
    queryKey: ['gifts', listId],
    queryFn: () => apiCall(`/api/gifts?list=${listId}`)
  });

  useWebSocket({
    topic: `gift-list:${listId}`,
    onMessage: (event) => {
      queryClient.invalidateQueries({ queryKey: ['gifts', listId] });
    }
  });

  return query;
}
```

### Drag-Drop Status Update
```typescript
// Kanban column receives drop, updates status
<div
  onDrop={(e) => {
    const giftId = e.dataTransfer?.getData('giftId');
    updateGiftStatus.mutate({ id: giftId, status: 'Purchased' });
  }}
>
  {/* cards here */}
</div>
```

### Modal with Details & Edit
```typescript
// Modal contains Overview tab + form editing
<Modal isOpen={!!selectedGift} onClose={() => setSelectedGift(null)}>
  <div className="flex md:flex-row">
    <div className="flex-1 p-10">
      {/* Display Overview, Linked Entities, History */}
    </div>
    <aside className="w-80 border-l p-8">
      {/* Smart Suggestions sidebar */}
    </aside>
  </div>
</Modal>
```

---

## Subagent Assignments

| Agent | Phases | Main Tasks |
|-------|--------|-----------|
| **ui-designer** | 1 | Design tokens, color system |
| **ui-engineer-enhanced** | 2-4 | Layout, nav, components, pages, features |
| **frontend-developer** | 1-6 | Animations, hooks, integration, testing |
| **web-accessibility-checker** | 6 | A11y audit, WCAG AA compliance |
| **react-performance-optimizer** | 6 | Performance tuning, code splitting |

---

## Quality Checklist (Per Phase)

### After Phase 1
- [ ] Tailwind config loads without errors
- [ ] All token colors render correctly
- [ ] Material Symbols icons display
- [ ] Dark mode toggle works

### After Phase 2
- [ ] Layout renders with correct sidebar offset
- [ ] Active nav state shows
- [ ] Safe-areas respected on iOS notch
- [ ] Mobile nav shows on sm: breakpoint

### After Phase 3
- [ ] All 12 components exported
- [ ] 44px touch targets verified
- [ ] Zero axe violations
- [ ] Responsive to all breakpoints

### After Phase 4
- [ ] 5 pages match inspiration design
- [ ] Forms validate and submit
- [ ] Responsive layouts work
- [ ] Page state management correct

### After Phase 5
- [ ] API calls work
- [ ] WebSocket updates propagate
- [ ] Drag-drop functional
- [ ] Optimistic updates correct
- [ ] 3G throttle <4s

### After Phase 6
- [ ] Animations smooth (60fps)
- [ ] Axe reports 0 violations
- [ ] Keyboard nav works
- [ ] 10+ E2E tests pass
- [ ] Lighthouse 90+ Performance, 95+ A11y

---

## Common Issues & Solutions

### Safe-Area Padding Not Working
**Issue**: Content overlapping notch on iPhone 14 Pro
**Solution**: Ensure `env(safe-area-inset-*)` applied in globals.css to main element

### WebSocket Connection Drops
**Issue**: Real-time updates stop
**Solution**: Implemented fallback polling every 10s; automatic reconnect with exponential backoff

### Kanban Cards Not Draggable
**Issue**: Drag events not firing
**Solution**: Ensure `draggable=true` on card element; use `onDragStart/onDragEnd` handlers

### Performance Issues on Mobile
**Issue**: Page sluggish, LCP >4s
**Solution**: Code split pages, lazy load images, enable React Query caching, reduce re-renders

---

## Getting Started

1. **Review Plan**: Read `ui-overhaul-v2-implementation.md` fully
2. **Check Details**: Reference `PHASE-DETAILS.md` for code patterns
3. **Start Phase 1**: Assign tasks to ui-designer + frontend-developer
4. **Track Progress**: Update `IMPLEMENTATION-CHECKLIST.md` daily
5. **Quality Gate**: Complete each phase quality checklist before proceeding

---

## Key Directories

```
/apps/web/
├── components/
│   ├── layout/           → AppLayout, Sidebar, Header, MobileNav
│   ├── ui/               → Button, Card, Input, Badge, Avatar, Modal, etc.
│   └── features/         → GiftDetailsModal, GiftForm, KanbanBoard, etc.
├── hooks/
│   ├── useGifts.ts
│   ├── useLists.ts
│   ├── useWebSocket.ts
│   └── useDarkMode.ts
├── app/
│   ├── (auth)/login/page.tsx
│   ├── dashboard/page.tsx
│   ├── lists/[id]/page.tsx (Kanban + Table)
│   ├── recipients/page.tsx
│   └── globals.css       → Animations, Material Symbols
└── tailwind.config.ts    → Design tokens
```

---

## Success Criteria

- [ ] All 6 phases complete within 5-6 weeks
- [ ] Pages match inspiration design pixel-perfectly
- [ ] React Query + WebSocket fully integrated
- [ ] Kanban drag-drop functional
- [ ] Zero a11y violations (axe)
- [ ] 90+ Lighthouse Performance score
- [ ] 10+ E2E tests passing
- [ ] <2.5s FCP on 3G mobile

---

## Support

- **Design Questions**: Reference `inspiration/family-gifting-v2/` files
- **Code Examples**: See `PHASE-DETAILS.md` for patterns
- **Task Tracking**: Update `IMPLEMENTATION-CHECKLIST.md`
- **Issues**: Document in `.claude/worknotes/`

---

**Version**: 1.0
**Created**: 2025-11-30
**Status**: Ready for Sprint Planning
