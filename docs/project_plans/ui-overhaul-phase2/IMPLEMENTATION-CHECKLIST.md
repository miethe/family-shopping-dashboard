# UI Overhaul V2 — Implementation Checklist

**Project**: Family Gifting Dashboard UI Redesign
**Start Date**: [To be set at sprint kickoff]
**Target Completion**: 5-6 weeks
**Total Effort**: ~55 story points

---

## Phase 1: Design System Foundation — 8 SP

### DS-001: Update Tailwind Config (3 SP)
- [ ] Create custom colors object (primary, background, status variants)
- [ ] Add Poppins, Quicksand, Spline Sans font families to fontFamily
- [ ] Configure border-radius tokens (3xl:32px, 2xl:24px, xl:16px)
- [ ] Add box-shadow variants (soft, card, lg)
- [ ] Configure dark mode: 'class'
- [ ] Add to theme.extend for custom spacing/sizes
- [ ] Test Tailwind classes compile correctly
- [ ] Verify primary color (#E57373) renders in browser

**Assigned to**: ui-designer
**PR**: [Link to PR]
**Completed**: [ ]

### DS-002: Global CSS & Animations (2 SP)
- [ ] Import Material Symbols Outlined font from Google Fonts
- [ ] Create globals.css with base styles
- [ ] Add safe-area-inset CSS vars to main element
- [ ] Define keyframes: fadeIn, slideUp, scaleIn
- [ ] Add @layer utilities for fade-in, slide-up, scale-in classes
- [ ] Configure scrollbar styling (webkit)
- [ ] Add prefers-reduced-motion media query
- [ ] Test animations 60fps (no jank)

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### DS-003: Material Symbols Icons (2 SP)
- [ ] Create Icon component (/components/ui/icon.tsx)
- [ ] Implement size variants (xs, sm, md, lg, xl)
- [ ] Test all Material Symbols icons render
- [ ] Document icon names with examples
- [ ] Add to component exports
- [ ] Test className prop forwarding

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### DS-004: Dark Mode Setup (1 SP)
- [ ] Create useDarkMode hook (/hooks/useDarkMode.ts)
- [ ] Implement localStorage persistence
- [ ] Detect system preference (prefers-color-scheme)
- [ ] Add theme toggle functionality
- [ ] Test dark/light class toggle on html element
- [ ] Verify all semantic colors have dark variants

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 1 Quality Gate**: [ ] All tokens defined; Material Symbols loads; no console errors

---

## Phase 2: Layout & Navigation — 8 SP

### LN-001: AppLayout Component (2 SP)
- [ ] Create AppLayout.tsx in /components/layout/
- [ ] Implement fixed flex layout (h-screen)
- [ ] Add Sidebar component with ml-offset
- [ ] Implement overflow-y-auto on main
- [ ] Add max-w-[1600px] container
- [ ] Test responsive behavior (sm/md/lg)
- [ ] Verify safe-area padding applied

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### LN-002: Sidebar Navigation (2 SP)
- [ ] Create Sidebar.tsx with glassmorphism (bg-white/60 backdrop-blur-md)
- [ ] Implement nav items with Material Symbols icons
- [ ] Add active state styling (bg-primary shadow-primary/30)
- [ ] Create tooltip on hover
- [ ] Add avatar at bottom
- [ ] Implement FAB button (Add Gift)
- [ ] Test responsive width (w-20 md:w-24)
- [ ] Test dark mode styling

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### LN-003: Mobile Bottom Nav (2 SP)
- [ ] Create MobileNav.tsx component
- [ ] Show only on sm: breakpoint
- [ ] Implement nav links (same as sidebar)
- [ ] Add fixed bottom positioning
- [ ] Test safe-area-inset-bottom padding
- [ ] Verify doesn't overlap content
- [ ] Test dark mode styling

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### LN-004: Header Component (2 SP)
- [ ] Create Header.tsx with sticky positioning
- [ ] Implement breadcrumbs navigation
- [ ] Add search input with icon
- [ ] Add action buttons (right-aligned)
- [ ] Test responsive collapse (mobile: stack)
- [ ] Implement dark mode support
- [ ] Test z-index layering with sidebar

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 2 Quality Gate**: [ ] Layout renders correctly; Sidebar active states work; safe-areas respected; responsive

---

## Phase 3: UI Component Library — 12 SP

### UC-001: Button Component (2 SP)
- [ ] Create button.tsx with 4 variants (primary, secondary, ghost, outline)
- [ ] Implement 3 sizes (sm, md, lg)
- [ ] Add disabled state styling
- [ ] Add loading state with spinner
- [ ] Test hover/focus states
- [ ] Verify 44px min touch target
- [ ] Test dark mode variants

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-002: Card Component (1 SP)
- [ ] Create card.tsx with 3 variants (default, elevated, outline)
- [ ] Implement header/body/footer structure
- [ ] Add actions support
- [ ] Test hover shadow effects
- [ ] Test dark mode styling

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-003: Input & Form Fields (1 SP)
- [ ] Create input.tsx with text/email/password/number types
- [ ] Add label + error message support
- [ ] Implement disabled state
- [ ] Test focus ring styling
- [ ] Add validation error styling

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-004: Badge Component (1 SP)
- [ ] Create badge.tsx with 4 status colors
- [ ] Add Material Symbols icon support
- [ ] Implement pill styling
- [ ] Test dark mode colors

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-005: Avatar Component (1 SP)
- [ ] Create avatar.tsx for single avatar
- [ ] Implement stacked avatars with -space-x
- [ ] Add hover reveal animation
- [ ] Test responsive sizing

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-006: Modal Component (2 SP)
- [ ] Create modal.tsx with overlay + content structure
- [ ] Implement close button
- [ ] Add backdrop blur and dismissal on click
- [ ] Test focus trap (keyboard nav within modal)
- [ ] Implement animation (scale-in)
- [ ] Test z-index layering

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-007: Stats Card Component (1 SP)
- [ ] Create stats-card.tsx with large number display
- [ ] Add label and icon support
- [ ] Implement hover lift effect
- [ ] Test responsive sizing

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-008: Timeline Component (1 SP)
- [ ] Create timeline.tsx with vertical line and dots
- [ ] Add activity item structure (avatar, text, timestamp)
- [ ] Test dark mode styling

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-009: Table Component (2 SP)
- [ ] Create table.tsx with sticky header
- [ ] Implement row hover effects
- [ ] Add pagination support
- [ ] Test responsive scroll
- [ ] Add action menu (3-dot button)

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### UC-010: SearchBar Component (1 SP)
- [ ] Create search-bar.tsx with input + icon
- [ ] Add clear button
- [ ] Implement onChange handler
- [ ] Test dark mode styling

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 3 Quality Gate**: [ ] All 10 components built; 44px touch targets verified; zero a11y violations

---

## Phase 4: Page Implementations — 14 SP

### PG-001: Login Page (2 SP)
- [ ] Create (auth)/login/page.tsx
- [ ] Implement split-screen layout
- [ ] Build form (email, password, submit)
- [ ] Add form validation
- [ ] Test error message display
- [ ] Verify responsive (mobile: single column)

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PG-002: Dashboard Page (3 SP)
- [ ] Create app/dashboard/page.tsx
- [ ] Implement 5/7 grid layout
- [ ] Build stats cards (Ideas, To Buy, Purchased counts)
- [ ] Create idea inbox section
- [ ] Build activity timeline
- [ ] Test responsive grid collapse

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PG-003: Lists Page (2 SP)
- [ ] Create app/lists/page.tsx
- [ ] Implement filter sidebar
- [ ] Build list cards grid
- [ ] Add occasion grouping
- [ ] Test load state skeleton
- [ ] Test responsive grid

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PG-004: List Details - Kanban (3 SP)
- [ ] Create app/lists/[id]/page.tsx (kanban view)
- [ ] Implement 4-column layout (Idea/To Buy/Purchased/Gifted)
- [ ] Build kanban cards with image/price/recipient
- [ ] Add horizontal scroll on mobile
- [ ] Implement view mode toggle (kanban ↔ table)
- [ ] Test empty column states

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PG-005: List Details - Table (2 SP)
- [ ] Create table view in app/lists/[id]/page.tsx
- [ ] Build table with 7 columns (Gift, Recipient, Status, Price, Category, Added By, Actions)
- [ ] Implement sticky header
- [ ] Add row click → detail modal
- [ ] Test responsive scroll
- [ ] Add sortable column headers

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PG-006: Recipients Page (2 SP)
- [ ] Create app/recipients/page.tsx
- [ ] Implement filter tabs (Household/Family/Friends/Other)
- [ ] Build occasion horizontal scroll
- [ ] Create recipient grid with cards
- [ ] Implement recipient detail modal
- [ ] Test responsive layout

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 4 Quality Gate**: [ ] All 5 pages built; layouts responsive; state management works

---

## Phase 5: Feature Components & Backend Integration — 13 SP

### FC-001: React Query Hooks (2 SP)
- [ ] Create hooks/useGifts.ts with query + mutations
- [ ] Create hooks/useLists.ts
- [ ] Create hooks/useRecipients.ts
- [ ] Create hooks/useOccasions.ts
- [ ] Implement proper cache keys
- [ ] Test staleTime/gcTime configuration
- [ ] Verify API endpoints match backend

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### FC-002: WebSocket Integration (2 SP)
- [ ] Create hooks/useWebSocket.ts
- [ ] Implement topic subscription
- [ ] Wire to useGifts (invalidate on GIFT_ADDED/UPDATED)
- [ ] Wire to useLists (invalidate on LIST_UPDATED)
- [ ] Add fallback polling (every 10s if WS down)
- [ ] Test reconnection logic
- [ ] Test message parsing

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### FC-003: Gift Details Modal (2 SP)
- [ ] Create components/features/GiftDetailsModal.tsx
- [ ] Implement tabs (Overview, Linked Entities, History)
- [ ] Add edit/delete buttons with confirm dialogs
- [ ] Build smart suggestions sidebar
- [ ] Test modal open/close
- [ ] Implement optimistic delete

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### FC-004: Gift Form Component (2 SP)
- [ ] Create components/features/GiftForm.tsx
- [ ] Implement fields (name, recipient, price, category, image, link)
- [ ] Add image upload + preview
- [ ] Build recipient dropdown
- [ ] Implement form validation
- [ ] Test create + edit modes

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### FC-005: Kanban Drag-Drop (2 SP)
- [ ] Integrate draggable API (or react-beautiful-dnd)
- [ ] Implement card drag start/end handlers
- [ ] Implement column drop handlers
- [ ] Wire status update mutation
- [ ] Add optimistic UI update
- [ ] Test rollback on error

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### FC-006: Recipients Modals (2 SP)
- [ ] Create components/features/RecipientDetailsModal.tsx
- [ ] Build recipient info display
- [ ] Implement edit form (sizes, interests, dates)
- [ ] Add form validation
- [ ] Test create + edit flows

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### FC-007: List Management (1 SP)
- [ ] Create list create form
- [ ] Add edit form (occasion, date)
- [ ] Implement archive/delete with confirm
- [ ] Test mutations trigger list refresh

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 5 Quality Gate**: [ ] API integration works; WebSocket updates propagate; drag-drop functional; optimistic updates rollback

---

## Phase 6: Polish & Testing — 8 SP

### PT-001: Animations & Transitions (2 SP)
- [ ] Add page fade-ins (fade-in class)
- [ ] Add card slide-ups on mount
- [ ] Implement modal scale-in animation
- [ ] Add button ripple/hover effects
- [ ] Test prefers-reduced-motion respected
- [ ] Verify 60fps (no jank on DevTools)

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

### PT-002: Responsive Testing (1 SP)
- [ ] Test xs:375 (iPhone SE)
- [ ] Test sm:640 (mobile)
- [ ] Test md:768 (iPad)
- [ ] Test lg:1024 and xl:1280 (desktop)
- [ ] Test safe-area-inset on notched iPhone 14 Pro
- [ ] Verify bottom nav doesn't overlap content

**Assigned to**: ui-engineer-enhanced
**PR**: [Link to PR]
**Completed**: [ ]

### PT-003: Accessibility Audit (2 SP)
- [ ] Run axe DevTools scan (0 violations target)
- [ ] Test color contrast (4.5:1 minimum)
- [ ] Test keyboard navigation (Tab/Enter on all interactive elements)
- [ ] Test focus visible on all buttons/inputs
- [ ] Add ARIA labels to icons
- [ ] Test screen reader with VoiceOver/NVDA
- [ ] Test modal focus trap
- [ ] Run Lighthouse a11y check (95+ score target)

**Assigned to**: web-accessibility-checker
**PR**: [Link to PR]
**Completed**: [ ]

### PT-004: Performance Optimization (2 SP)
- [ ] Measure FCP (target <2.5s on 3G mobile)
- [ ] Measure LCP (target <4s on 3G mobile)
- [ ] Measure CLS (target <0.1)
- [ ] Analyze React DevTools for wasteful re-renders
- [ ] Implement code splitting for pages
- [ ] Optimize images (Next.js Image component)
- [ ] Run Lighthouse Performance audit (90+ target)

**Assigned to**: react-performance-optimizer
**PR**: [Link to PR]
**Completed**: [ ]

### PT-005: E2E Test Suite (1 SP)
- [ ] Write login flow test
- [ ] Write create gift test (navigate → form → submit)
- [ ] Write drag-drop test (Kanban board)
- [ ] Write real-time update test (WebSocket)
- [ ] Write responsive test (iPhone 14 emulation)
- [ ] Run all tests in CI/CD
- [ ] Target: 10+ tests passing, 100% critical path coverage

**Assigned to**: frontend-developer
**PR**: [Link to PR]
**Completed**: [ ]

**Phase 6 Quality Gate**: [ ] No a11y violations; 90+ Lighthouse Performance; 10+ E2E tests passing

---

## Final Deliverables

- [ ] All code merged to main branch
- [ ] `/apps/web/` fully refactored with new design
- [ ] All 5 pages match inspiration design
- [ ] React Query + WebSocket integration complete
- [ ] Kanban board with drag-drop functional
- [ ] 100+ test coverage for critical paths
- [ ] README updated with new component library
- [ ] Design system documented in DESIGN-TOKENS.md

---

## Blockers & Risks

| Issue | Status | Notes |
|-------|--------|-------|
| WebSocket connection drops | - | Will implement reconnect with exponential backoff |
| Drag-drop library conflicts | - | Use native API if issues arise |
| Safe-area edge cases on iPhone | - | Will test on physical device |
| Performance regression | - | Monitor React DevTools each phase |

---

## Sign-Off

- [ ] Phase 1 Lead (ui-designer): Completed & Reviewed
- [ ] Phase 2-4 Lead (ui-engineer-enhanced): Completed & Reviewed
- [ ] Integration Lead (frontend-developer): Completed & Reviewed
- [ ] QA Lead (web-accessibility-checker): Completed & Reviewed
- [ ] Product Owner: Approved for Release

---

**Document Created**: 2025-11-30
**Last Updated**: [Auto-update with progress]
