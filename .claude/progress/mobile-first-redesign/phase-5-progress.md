---
# === PROGRESS TRACKING: PHASE 5 ===
# Advanced Mobile UX & Optimization - Task orchestration for AI agents

type: progress
prd: "mobile-first-redesign"
phase: 5
title: "Advanced Mobile UX & Optimization"
status: "planning"
started: null
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 6
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["ui-engineer-enhanced", "frontend-developer"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "MOB-501"
    description: "Gesture-driven page transitions - smooth slide-in/out animations on navigation"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-305"]
    estimated_effort: "2h"
    priority: "medium"

  - id: "MOB-502"
    description: "Skeleton loading states - create skeleton components for all async data loads"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-305"]
    estimated_effort: "1.5h"
    priority: "medium"

  - id: "MOB-503"
    description: "Navigation drawer - slide-in drawer from left with profile, settings, logout"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced", "frontend-developer"]
    dependencies: ["MOB-202"]
    estimated_effort: "2h"
    priority: "medium"

  - id: "MOB-504"
    description: "Bottom sheets for actions - implement bottom sheet component for filters/actions"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-305"]
    estimated_effort: "1.5h"
    priority: "medium"

  - id: "MOB-505"
    description: "Dark mode support - implement dark mode respecting iOS system setting"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-502"]
    estimated_effort: "1h"
    priority: "medium"

  - id: "MOB-506"
    description: "Empty & error states - create contextual empty and error state components"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-502"]
    estimated_effort: "1h"
    priority: "medium"

# Parallelization Strategy
parallelization:
  batch_1: ["MOB-501", "MOB-502", "MOB-503", "MOB-504"]
  batch_2: ["MOB-505", "MOB-506"]
  critical_path: ["MOB-305", "MOB-502", "MOB-505"]
  estimated_total_time: "6-8 days"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Page transitions smooth at 60fps, respect prefers-reduced-motion"
    status: "pending"
  - id: "SC-2"
    description: "Skeleton loaders appear during loading, replace smoothly"
    status: "pending"
  - id: "SC-3"
    description: "Navigation drawer functional, safe areas respected"
    status: "pending"
  - id: "SC-4"
    description: "Bottom sheets appear/dismiss smoothly"
    status: "pending"
  - id: "SC-5"
    description: "Dark mode respects system setting, toggle works"
    status: "pending"
  - id: "SC-6"
    description: "All major views have helpful empty/error states"
    status: "pending"
  - id: "SC-7"
    description: "Lighthouse mobile score ≥90"
    status: "pending"
  - id: "SC-8"
    description: "E2E: Page transitions, loading states, dark mode toggle"
    status: "pending"
  - id: "SC-9"
    description: "All features tested on real iOS devices"
    status: "pending"
  - id: "SC-10"
    description: "No critical issues, all quality gates met"
    status: "pending"

# Files Modified
files_modified:
  - "apps/web/components/shared/page-transition.tsx"
  - "apps/web/components/ui/skeleton.tsx"
  - "apps/web/components/shared/navigation-drawer.tsx"
  - "apps/web/components/ui/bottom-sheet.tsx"
  - "apps/web/app/layout.tsx"
  - "apps/web/components/shared/empty-state.tsx"
  - "apps/web/components/shared/error-state.tsx"
  - "apps/web/app/globals.css"
---

# Mobile-First Redesign - Phase 5: Advanced Mobile UX & Optimization

**Phase**: 5 of 5
**Status**: 🔵 Planning (0% complete)
**Duration**: Target 6-8 working days (can run parallel with later Phase 4 after Phases 2-3)
**Owner**: ui-engineer-enhanced, frontend-developer
**Contributors**: None

---

## Orchestration Quick Reference

> For orchestration agents: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - Most depend on Phase 3 MOB-305):
- MOB-501 → `frontend-developer` (2h)
- MOB-502 → `ui-engineer-enhanced` (1.5h)
- MOB-503 → `ui-engineer-enhanced` + `frontend-developer` (2h)
- MOB-504 → `ui-engineer-enhanced` (1.5h)

All can start after Phase 3 MOB-305 complete (or after Phase 2 MOB-202 for MOB-503)

**Batch 2** (Parallel - Depends on MOB-502):
- MOB-505 → `ui-engineer-enhanced` (1h) - **Blocked by**: MOB-502
- MOB-506 → `ui-engineer-enhanced` (1h) - **Blocked by**: MOB-502

**Critical Path**: MOB-502 → MOB-505 (2.5 hours sequential)

### Task Delegation Commands

```
# Batch 1 - Launch after Phase 3 MOB-305 complete (or Phase 2 MOB-202 for MOB-503)
Task("frontend-developer", "MOB-501: Implement smooth page transition animations. Slide-in/out 300-400ms, 60fps. Respect prefers-reduced-motion. Test on real device.")

Task("ui-engineer-enhanced", "MOB-502: Create skeleton loading components for async data. Apply to all pages (Dashboard, Lists, Gifts, People). Prevents perceived lag.")

Task("ui-engineer-enhanced frontend-developer", "MOB-503: Build navigation drawer. Slide-in from left, profile/settings/logout. Safe areas respected. Optional alternative to bottom nav.")

Task("ui-engineer-enhanced", "MOB-504: Implement bottom sheet component. For filters, actions, info. Swipe-to-dismiss, responsive, tested on mobile.")

# Batch 2 - After MOB-502 complete
Task("ui-engineer-enhanced", "MOB-505: Implement dark mode. Respect iOS prefers-color-scheme setting. Tailwind dark: mode. Toggle in settings. Test both modes.")

Task("ui-engineer-enhanced", "MOB-506: Create empty state and error state components. For all major views (no lists, no gifts, network error, etc.). Helpful, actionable.")
```

---

## Overview

**Phase 5 Mission**: Polish the mobile experience with advanced UX features that elevate it from functional to delightful.

**Why This Phase**: Phases 1-4 make the app usable offline with gestures and PWA features. Phase 5 adds the final polish: smooth animations, loading states that reduce perceived lag, dark mode, and contextual empty/error states that guide users.

**Scope**:
- **IN SCOPE**: Page transition animations, skeleton loading states, navigation drawer, bottom sheets, dark mode, empty/error states
- **OUT OF SCOPE**: New features, additional gestures, advanced animations

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Page transitions smooth at 60fps, respect prefers-reduced-motion | ⏳ Pending |
| SC-2 | Skeleton loaders appear during loading, replace smoothly | ⏳ Pending |
| SC-3 | Navigation drawer functional, safe areas respected | ⏳ Pending |
| SC-4 | Bottom sheets appear/dismiss smoothly | ⏳ Pending |
| SC-5 | Dark mode respects system setting, toggle works | ⏳ Pending |
| SC-6 | All major views have helpful empty/error states | ⏳ Pending |
| SC-7 | Lighthouse mobile score ≥90 | ⏳ Pending |
| SC-8 | E2E: Page transitions, loading states, dark mode toggle | ⏳ Pending |
| SC-9 | All features tested on real iOS devices | ⏳ Pending |
| SC-10 | No critical issues, all quality gates met | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| MOB-501 | Gesture-driven page transitions | ⏳ | frontend-developer | MOB-305 | 2h | 300-400ms, 60fps, prefers-reduced-motion |
| MOB-502 | Skeleton loading states | ⏳ | ui-engineer-enhanced | MOB-305 | 1.5h | All async data loads, smooth replace |
| MOB-503 | Navigation drawer | ⏳ | ui-engineer-enhanced, frontend-developer | MOB-202 | 2h | Slide-in left, profile/settings, safe areas |
| MOB-504 | Bottom sheets for actions | ⏳ | ui-engineer-enhanced | MOB-305 | 1.5h | Slide-up, swipe-dismiss, responsive |
| MOB-505 | Dark mode support | ⏳ | ui-engineer-enhanced | MOB-502 | 1h | prefers-color-scheme, toggle, both modes |
| MOB-506 | Empty & error states | ⏳ | ui-engineer-enhanced | MOB-502 | 1h | Contextual, helpful, action-oriented |

**Status Legend**: `⏳` Pending | `🔄` In Progress | `✓` Complete | `🚫` Blocked | `⚠️` At Risk

---

## Architecture Context

### Current State

**Animation & Transitions**:
- Basic routing transitions may exist
- No gesture-driven animations
- Framer Motion or React Spring not yet integrated

**Loading States**:
- React Query handles data fetching
- No skeleton/placeholder components yet
- Blank screens during load (not great UX)

**Navigation**:
- Bottom nav fully implemented (Phase 2)
- No navigation drawer yet (optional alternative)

**Theming**:
- Tailwind CSS supports dark mode
- No dark mode implementation yet
- No system preference detection

**State Components**:
- No empty state or error state components yet
- Generic error messages shown

### Reference Patterns

**Skeleton Loading Pattern**:
```jsx
// components/ui/skeleton.tsx
export const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded h-4" />
);

// Usage in list
{isLoading ? <Skeleton /> : <ListItem />}
```

**Dark Mode Pattern**:
```jsx
// app/globals.css
@media (prefers-color-scheme: dark) {
  /* Dark mode colors */
}

// Or with Tailwind
<div className="dark:bg-gray-900">...</div>
```

**Empty State Pattern**:
```jsx
export const EmptyState = ({ message, action }) => (
  <div className="text-center py-8">
    <EmptyIcon className="mx-auto mb-4" />
    <p className="text-gray-500 mb-4">{message}</p>
    <button onClick={action}>Create First Item</button>
  </div>
);
```

---

## Implementation Details

### Technical Approach

**Step 1: Gesture-Driven Page Transitions (MOB-501)**

Add smooth animations when navigating between pages:

1. Animation libraries:
   - **Framer Motion** (popular, well-tested)
   - **React Spring** (physics-based)
   - **CSS transitions** (simpler, lighter)

2. Implementation approach:
   - Wrap page content in motion component
   - Slide-in animation on mount (300-400ms)
   - Slide-out on route change
   - Fade in/out for opacity
   - X-axis transform for slide effect

3. Code example (Framer Motion):
   ```jsx
   <motion.div
     initial={{ opacity: 0, x: 100 }}
     animate={{ opacity: 1, x: 0 }}
     exit={{ opacity: 0, x: -100 }}
     transition={{ duration: 0.3 }}
   >
     {/* Page content */}
   </motion.div>
   ```

4. Accessibility:
   - Respect `prefers-reduced-motion` media query
   - Disable animations if user disabled motion
   - Keep animations brief (300-400ms max)

5. Testing:
   - Record animation with DevTools
   - Verify 60fps on modern devices
   - Test on iPhone SE (older device, may be slower)

**Step 2: Skeleton Loading States (MOB-502)**

Add placeholder/skeleton components while loading:

1. Create skeleton component:
   - Pulsing gray rectangles matching content layout
   - Replicates actual content shape
   - Quick to render, minimal re-rendering

2. Apply to pages:
   - Dashboard: skeleton boxes for gift list, budget meter
   - Lists page: skeleton list items
   - People page: skeleton people cards
   - Occasions page: skeleton occasion cards

3. Usage pattern:
   ```jsx
   const { data: gifts, isLoading } = useGifts();

   return isLoading ? (
     <div className="space-y-4">
       <Skeleton className="h-24" />
       <Skeleton className="h-24" />
     </div>
   ) : (
     <GiftList gifts={gifts} />
   );
   ```

4. Animation:
   - Subtle pulse animation (opacity change, not movement)
   - Respects `prefers-reduced-motion`
   - 1-2 second pulse cycle

**Step 3: Navigation Drawer (MOB-503)**

Create optional slide-in drawer for mobile:

1. Drawer component:
   - Slides in from left edge
   - Contains: profile section, settings, logout
   - Swipe left or tap close button to dismiss
   - Full viewport height, safe area aware

2. Trigger:
   - Hamburger icon in header (or optional)
   - Alternative to bottom nav (not replacement)

3. Content:
   - Profile card: avatar, name, email
   - Settings link
   - Logout button
   - Safe area padding (top for notch, bottom for home indicator)

4. Implementation:
   - Use Radix Dialog or custom drawer component
   - Position: fixed left, translate transform for animation
   - Z-index above content
   - Backdrop/overlay to close

5. Testing:
   - Swipe to open/close works
   - Safe areas respected
   - Content fully visible (not cut off by notch)

**Step 4: Bottom Sheets (MOB-504)**

Implement bottom sheet component for actions/filters:

1. Bottom sheet component:
   - Slides up from bottom
   - Contains actions, filters, or info
   - Swipe down or tap close to dismiss
   - Rounded top corners (iOS standard)

2. Use cases:
   - Filter options for lists
   - Action menus (delete, edit, share)
   - Additional info or settings

3. Implementation:
   - Similar to drawer but from bottom
   - Position: fixed bottom
   - Slide animation
   - Backdrop to dismiss

4. Features:
   - Drag handle indicator at top
   - Dismissible by swiping down
   - Smooth animation (300ms)
   - Safe area padding (bottom for home indicator)

**Step 5: Dark Mode Support (MOB-505)**

Implement system dark mode preference:

1. Detection:
   - Use `prefers-color-scheme` media query
   - Media query listener: `window.matchMedia('(prefers-color-scheme: dark)')`
   - Detect system preference on load

2. CSS implementation:
   - Tailwind `dark:` class prefix
   - Or CSS `@media (prefers-color-scheme: dark)`

3. Manual toggle (optional):
   - Settings page toggle to override system preference
   - Store in localStorage
   - Apply override if set

4. Color adjustments:
   - Light mode: light backgrounds, dark text (current)
   - Dark mode: dark backgrounds, light text
   - Ensure contrast ≥4.5:1

5. Implementation:
   ```jsx
   // app/layout.tsx
   const isDarkMode = useMatchMedia('(prefers-color-scheme: dark)');

   return (
     <html className={isDarkMode ? 'dark' : ''}>
       {/* Content */}
     </html>
   );
   ```

**Step 6: Empty & Error States (MOB-506)**

Create contextual empty and error state components:

1. Empty state component:
   - Icon (illustrative)
   - Heading: "No gifts yet"
   - Message: Friendly explanation
   - Action: Button to create first item
   - Centered, spacious layout

2. Error state component:
   - Error icon
   - Heading: "Something went wrong"
   - Message: Specific error context
   - Action: "Retry" button or "Go back" link
   - Optional: error code or details

3. Apply to pages:
   - Dashboard: "No gifts yet, tap + to add one"
   - Lists: "No lists created, start planning"
   - Occasions: "No occasions found"
   - Network error: "Check your connection and try again"

4. Implementation:
   ```jsx
   export const EmptyState = ({ icon: Icon, heading, message, action }) => (
     <div className="flex flex-col items-center justify-center py-12">
       <Icon className="w-12 h-12 text-gray-300 mb-4" />
       <h3 className="text-lg font-semibold mb-2">{heading}</h3>
       <p className="text-gray-500 text-center mb-6 max-w-sm">{message}</p>
       {action && <button onClick={action}>{action.label}</button>}
     </div>
   );
   ```

### Known Gotchas

**Gotcha 1: Page Transitions Can Interfere with Navigation**
- Animations can cause delayed navigation perception
- If too long or janky, feels sluggish
- **Solution**: Keep animations 300-400ms max, ensure 60fps

**Gotcha 2: Skeleton Loaders Not Matching Content Size**
- If skeleton dimensions don't match actual content, layout shift occurs
- Creates poor UX (jank)
- **Solution**: Make skeleton exact same height/width as content it replaces

**Gotcha 3: Dark Mode Colors Not Accessible**
- Dark mode with poor contrast makes text unreadable
- **Solution**: Verify contrast ≥4.5:1 in both light and dark modes

**Gotcha 4: Bottom Sheet Blocking Critical UI**
- Bottom sheet can cover important content or buttons
- Keyboard can also cover content
- **Solution**: Ensure content scrollable, keyboard handling, close button always accessible

**Gotcha 5: prefers-reduced-motion Not Respected**
- Some users disable animations for accessibility or motion sickness
- Ignoring this preference is accessibility violation
- **Solution**: Always check `prefers-reduced-motion`, skip animations if true

**Gotcha 6: Navigation Drawer Conflicting with Bottom Nav**
- If both drawer and bottom nav present, UX can be confusing
- Two navigation systems competing
- **Solution**: Use drawer as alternative (user chooses), not both simultaneously

### Development Setup

**Tools Needed**:
- Framer Motion or React Spring for animations (or use CSS)
- Tailwind CSS dark mode (already configured)
- Chrome DevTools for animation profiling
- Real iOS device for dark mode testing (check system settings)

**Testing Tools**:
- Chrome DevTools: Performance profiling for animations
- iOS Settings: Appearance settings to toggle dark mode
- Prefers-reduced-motion testing: Enable in System Preferences

---

## Blockers

### Active Blockers

| ID | Title | Severity | Blocking | Resolution |
|----|-------|----------|----------|-----------|
| BLOCKER-501-001 | Phase 2 MOB-202 must complete (for MOB-503 drawer context) | high | MOB-503 | Ensure Phase 2 quality gates passed |

### Resolved Blockers

N/A (Phase 5 hasn't started)

---

## Dependencies

### External Dependencies

- **Framer Motion** (optional): Animation library
- **Tailwind CSS**: Dark mode support (already in use)
- **prefers-color-scheme media query**: Browser support (all modern browsers)
- **prefers-reduced-motion media query**: Browser support (all modern browsers)

### Internal Integration Points

- **React Router**: Page transitions hook into route changes
- **React Query**: Loading states for data fetching
- **Layout component**: Dark mode applied globally
- **Navigation components**: Drawer, bottom sheet integrate with routing

### Inter-Phase Dependencies

**Phase 5 depends on**:
- Phase 1 (MOB-107) complete
- Phase 2 (MOB-202) complete for context
- Phase 3 (MOB-305) complete for animation optimization

**No downstream phases** (Phase 5 is final phase)

---

## Testing Strategy

### Unit Tests

- Dark mode preference detection
- Skeleton animation timing
- Empty/error state rendering with props
- Reduced motion detection

### Integration Tests

- Page transitions work with React Router
- Dark mode applied to all components
- Loading state transitions (skeleton → content)
- Empty states show appropriate content
- Drawer open/close works
- Bottom sheet dismiss works

### E2E Tests (Playwright)

```gherkin
Scenario: Page transition animation
  When I navigate from Dashboard to Lists page
  Then page slides in smoothly
  And animation completes in 300-400ms
  And no jank or dropped frames

Scenario: Skeleton loading state
  When I open Lists page
  Then skeleton loaders appear
  And after data loads, content replaces skeleton smoothly

Scenario: Dark mode preference
  When I set iOS to Dark Mode
  And I refresh app
  Then app switches to dark theme
  And text contrast is readable

Scenario: Navigation drawer
  When I tap hamburger icon
  Then drawer slides in from left
  And profile, settings, logout visible
  And I can close by swiping left or tapping close

Scenario: Bottom sheet dismiss
  When I open filter bottom sheet
  Then sheet slides up
  And I can dismiss by swiping down or tapping close

Scenario: Empty state
  When I view Lists page with no lists
  Then empty state icon and message shown
  And "Create List" button visible
  And tapping button navigates to create flow

Scenario: Error state
  When API request fails
  Then error state shown with message
  And "Retry" button visible
```

### Device Testing Matrix

| Device | Animations | Dark Mode | Drawer | Sheets | Empty States |
|--------|---|---|---|---|---|
| iPhone SE | ✓ (30fps acceptable) | ✓ | ✓ | ✓ | ✓ |
| iPhone 14 | ✓ (60fps) | ✓ | ✓ | ✓ | ✓ |
| iPad | ✓ (60fps) | ✓ | ✓ | ✓ | ✓ |

**Required Testing**:
- [ ] Page transitions smooth at 60fps on modern devices
- [ ] Skeleton loaders appear and replace smoothly
- [ ] Dark mode respects system setting
- [ ] Dark mode toggle works in settings
- [ ] Navigation drawer functions on all pages
- [ ] Bottom sheets appear and dismiss
- [ ] Empty states on all empty pages
- [ ] Error states display on API errors
- [ ] All components tested on real iOS device
- [ ] Lighthouse mobile score ≥90

### Performance Testing

- **Animations**: Record with DevTools, verify 60fps
- **Skeleton rendering**: Monitor re-render count
- **Dark mode switch**: Ensure instant toggle without lag
- **Bundle size**: Monitor for regressions from animation library

### Accessibility Testing

- **prefers-reduced-motion**: Animations disabled when setting enabled
- **Dark mode contrast**: Text ≥4.5:1 in both modes
- **Drawer navigation**: Keyboard navigation works
- **Bottom sheet**: Close button always accessible

---

## Next Session Agenda

### Immediate Actions (When Phase 5 Begins)

1. [ ] **MOB-501**: Implement page transition animations (300-400ms, 60fps)
2. [ ] **MOB-502**: Create skeleton loading components for all pages
3. [ ] **MOB-503**: Build navigation drawer (optional, profile/settings)
4. [ ] **MOB-504**: Implement bottom sheet component
5. [ ] **MOB-505**: Add dark mode support with system preference detection
6. [ ] **MOB-506**: Create empty and error state components

### Parallelization Opportunity

After MOB-502 completes, MOB-505 and MOB-506 can run in parallel.

### Context for Continuing Agent

Phase 5 is the final polishing phase. The primary challenges are:

1. **Animation performance**: 60fps on modern devices, fallback to 30fps on older
2. **Skeleton matching**: Dimensions must match actual content to avoid layout shift
3. **Dark mode accessibility**: Ensure contrast and readability
4. **Component composition**: Drawer and bottom sheet must integrate smoothly with existing layout
5. **UX coherence**: All features must feel cohesive and native

The phase is complete when all 10 success criteria are met and Phase 5 quality gates pass.

---

## Session Notes

### (To be updated as work progresses)

#### Next Session Entry Template

```
### [DATE]

**Completed**:
- MOB-XXX: Task description with outcome

**In Progress**:
- MOB-XXX: Current status and next step

**Blockers**:
- BLOCKER-XXX: Description and resolution path

**Next Session**:
- Action item with context
```

---

## Additional Resources

- **Phase 1-4 Progress**: `.claude/progress/mobile-first-redesign/phase-[1-4]-progress.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Context**: `.claude/worknotes/mobile-first-redesign/context.md`
- **Web Patterns**: `apps/web/CLAUDE.md`
- **Design Tokens**: `/docs/designs/DESIGN-TOKENS.md`
