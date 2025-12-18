---
# === PROGRESS TRACKING: PHASE 3 ===
# Touch Interactions & Gestures - Task orchestration for AI agents

type: progress
prd: "mobile-first-redesign"
phase: 3
title: "Touch Interactions & Gestures"
status: "planning"
started: null
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 5
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["frontend-developer", "mobile-app-builder"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "MOB-301"
    description: "Swipe-to-go-back gesture - implement swipe right on detail pages for back navigation"
    status: "pending"
    assigned_to: ["frontend-developer", "mobile-app-builder"]
    dependencies: ["MOB-202"]
    estimated_effort: "2h"
    priority: "high"

  - id: "MOB-302"
    description: "Pull-to-refresh on lists - add pull-down indicator, spinner, success feedback on list and dashboard pages"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-202"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-303"
    description: "Haptic feedback on actions - integrate Vibration API for light haptic on button taps and critical actions"
    status: "pending"
    assigned_to: ["mobile-app-builder"]
    dependencies: ["MOB-202"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-304"
    description: "Mobile active/press states - audit all tappable elements, ensure visible active/press state feedback"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-202"]
    estimated_effort: "1h"
    priority: "high"

  - id: "MOB-305"
    description: "60fps animations on mobile - ensure gesture animations and transitions run at 60fps on modern devices"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-301"]
    estimated_effort: "1h"
    priority: "high"

# Parallelization Strategy
parallelization:
  batch_1: ["MOB-301", "MOB-302", "MOB-303", "MOB-304"]
  batch_2: ["MOB-305"]
  critical_path: ["MOB-301", "MOB-305"]
  estimated_total_time: "4-5 days"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Swipe-right gesture works on detail pages, back navigation functions"
    status: "pending"
  - id: "SC-2"
    description: "Pull-to-refresh appears, animates, refreshes data, shows success state"
    status: "pending"
  - id: "SC-3"
    description: "Haptic feedback on button taps (light vibration)"
    status: "pending"
  - id: "SC-4"
    description: "All tap targets have visible active/press state"
    status: "pending"
  - id: "SC-5"
    description: "No hover-only styles on mobile views"
    status: "pending"
  - id: "SC-6"
    description: "Animations at 60fps on modern devices (verified with DevTools)"
    status: "pending"
  - id: "SC-7"
    description: "Respects prefers-reduced-motion for accessibility"
    status: "pending"
  - id: "SC-8"
    description: "E2E: Swipe, pull-to-refresh, tap with haptic feedback"
    status: "pending"
  - id: "SC-9"
    description: "No conflicts with browser default gestures"
    status: "pending"
  - id: "SC-10"
    description: "No critical issues on devices"
    status: "pending"

# Files Modified
files_modified:
  - "apps/web/components/shared/gesture-provider.tsx"
  - "apps/web/components/shared/pull-to-refresh.tsx"
  - "apps/web/hooks/useGesture.ts"
  - "apps/web/hooks/useHaptic.ts"
  - "apps/web/components/ui/button.tsx"
  - "All page components for active/press states"
---

# Mobile-First Redesign - Phase 3: Touch Interactions & Gestures

**Phase**: 3 of 5
**Status**: 🔵 Planning (0% complete)
**Duration**: Target 4-5 working days (can run parallel with Phases 2-4 after Phase 1)
**Owner**: frontend-developer, mobile-app-builder
**Contributors**: None

---

## Orchestration Quick Reference

> For orchestration agents: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - Depends on Phase 2 MOB-202):
- MOB-301 → `frontend-developer` + `mobile-app-builder` (2h)
- MOB-302 → `frontend-developer` (1.5h)
- MOB-303 → `mobile-app-builder` (1.5h)
- MOB-304 → `ui-engineer-enhanced` (1h)

**Batch 2** (Sequential - Depends on MOB-301):
- MOB-305 → `frontend-developer` (1h) - **Blocked by**: MOB-301

**Critical Path**: MOB-301 → MOB-305 (3 hours sequential)

### Task Delegation Commands

```
# Batch 1 - Launch after Phase 2 MOB-202 complete (can run parallel with Phase 2)
Task("frontend-developer mobile-app-builder", "MOB-301: Implement swipe-right gesture on detail pages for back navigation. Use gesture library (Hammer.js or custom), smooth animation, no browser conflict. Test on real iOS.")

Task("frontend-developer", "MOB-302: Add pull-to-refresh component to lists and dashboard. Visual indicator, spinner during refresh, success feedback (checkmark). Works on mobile.")

Task("mobile-app-builder", "MOB-303: Integrate Vibration API for haptic feedback. Light haptic on button taps and critical actions (delete, confirm). Feature detect, graceful fallback.")

Task("ui-engineer-enhanced", "MOB-304: Audit all tappable elements. Ensure visible active/press state (color change, scale, highlight). Remove hover-only styles on mobile.")

# Batch 2 - After MOB-301 complete
Task("frontend-developer", "MOB-305: Verify gesture animations run at 60fps on modern devices (iPhone 12+). Use Chrome DevTools performance profiler. 30fps acceptable on older devices.")
```

---

## Overview

**Phase 3 Mission**: Add delightful iOS-native touch interactions that enhance navigation and list management.

**Why This Phase**: Phase 2 made the app navigable and usable. Phase 3 adds gestures and interactive feedback that feel native to iOS and improve the experience. Swipe-back is expected; pull-to-refresh is familiar; haptics are rewarding.

**Scope**:
- **IN SCOPE**: Swipe gestures (back, dismiss), pull-to-refresh, haptic feedback, active/press states, animation performance
- **OUT OF SCOPE**: PWA features (Phase 4), advanced UX (Phase 5)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Swipe-right gesture works on detail pages, back navigation functions | ⏳ Pending |
| SC-2 | Pull-to-refresh appears, animates, refreshes data, shows success state | ⏳ Pending |
| SC-3 | Haptic feedback on button taps (light vibration) | ⏳ Pending |
| SC-4 | All tap targets have visible active/press state | ⏳ Pending |
| SC-5 | No hover-only styles on mobile views | ⏳ Pending |
| SC-6 | Animations at 60fps on modern devices (verified with DevTools) | ⏳ Pending |
| SC-7 | Respects prefers-reduced-motion for accessibility | ⏳ Pending |
| SC-8 | E2E: Swipe, pull-to-refresh, tap with haptic feedback | ⏳ Pending |
| SC-9 | No conflicts with browser default gestures | ⏳ Pending |
| SC-10 | No critical issues on devices | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| MOB-301 | Swipe-to-go-back gesture | ⏳ | frontend-developer, mobile-app-builder | MOB-202 | 2h | Detail pages, back navigation, smooth animation |
| MOB-302 | Pull-to-refresh on lists | ⏳ | frontend-developer | MOB-202 | 1.5h | Visual indicator, spinner, success feedback |
| MOB-303 | Haptic feedback on actions | ⏳ | mobile-app-builder | MOB-202 | 1.5h | Vibration API, feature detect, graceful fallback |
| MOB-304 | Mobile active/press states | ⏳ | ui-engineer-enhanced | MOB-202 | 1h | Visible feedback, no hover-only styles |
| MOB-305 | 60fps animations on mobile | ⏳ | frontend-developer | MOB-301 | 1h | Modern devices, DevTools profiling verified |

**Status Legend**: `⏳` Pending | `🔄` In Progress | `✓` Complete | `🚫` Blocked | `⚠️` At Risk

---

## Architecture Context

### Current State

**Gesture Support**:
- No gesture library currently integrated
- Possible libraries: Hammer.js (touch gestures), React Gesture Responder, or custom implementation
- Browser has native back gesture (swipe right) - must not conflict

**Pull-to-Refresh**:
- No pull-to-refresh component currently exists
- Common libraries: `react-pull-to-refresh`, `react-refresh`, or custom

**Haptic Feedback**:
- Vibration API available in modern browsers/devices (iOS 13+)
- `navigator.vibrate()` for simple vibration
- `navigator.haptics` (Web Haptics API) in development but not widely supported yet

**Animation Performance**:
- React Query handles most state updates
- Potential performance issues: 60fps not guaranteed on older devices
- DevTools performance profiler available in Chrome

**Active/Press States**:
- Existing button and component styling may use hover
- Mobile needs active state visible on tap (not hover)

### Reference Patterns

**Gesture Pattern** (from similar mobile apps):
```jsx
// Swipe-back on detail pages
const handleSwipe = (direction) => {
  if (direction === 'right') {
    navigate(-1);
  }
};
```

**Pull-to-Refresh Pattern**:
```jsx
// Custom or library component
<PullToRefresh onRefresh={handleRefresh}>
  <ListContent />
</PullToRefresh>
```

**Haptic Pattern**:
```jsx
const hapticFeedback = (intensity = 'light') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(intensity === 'light' ? 10 : 50);
  }
};
```

---

## Implementation Details

### Technical Approach

**Step 1: Implement Swipe-to-Go-Back (MOB-301)**

Add gesture detection for swipe-right on detail pages:

1. Choose gesture library:
   - **Hammer.js** (popular, well-tested, ~9KB gzipped)
   - **Custom**: Implement swipe detection manually (TrackingEvents)
   - **React-based**: `@use-gesture/react` library

2. Create gesture provider/hook:
   ```jsx
   // hooks/useGesture.ts
   export const useSwipeBack = (callback) => {
     useEffect(() => {
       const handleSwipe = (e) => {
         if (e.direction === 'right') callback();
       };
       // Attach listener
     }, []);
   };
   ```

3. Apply to detail pages (list detail, person detail, etc.):
   ```jsx
   // Detail page
   useSwipeBack(() => navigate(-1));
   ```

4. Animation: Smooth slide-out animation when swiping
   - Use CSS transitions or Framer Motion
   - Opacity fade + X translation (300-400ms)

5. Testing: Verify swipe doesn't conflict with browser's native back gesture

**Step 2: Add Pull-to-Refresh (MOB-302)**

Implement pull-down gesture with refresh indicator:

1. Create pull-to-refresh component:
   ```jsx
   // components/shared/pull-to-refresh.tsx
   export const PullToRefresh = ({ children, onRefresh }) => {
     // Detect pull-down (touch move up from top)
     // Show indicator when pulled > threshold
     // Trigger refresh when released
     // Show success/checkmark
   };
   ```

2. Apply to pages:
   - Dashboard page
   - All list pages
   - Anywhere data can be refreshed

3. Visual feedback:
   - Pull indicator (pull down to refresh message)
   - Spinner during refresh
   - Success checkmark when complete

4. Refresh action:
   - Call React Query `refetch()` or similar
   - Invalidate relevant cache

**Step 3: Add Haptic Feedback (MOB-303)**

Integrate Vibration API for tactile feedback:

1. Create haptic utility/hook:
   ```jsx
   // hooks/useHaptic.ts
   export const useHaptic = () => {
     return (intensity = 'light') => {
       if ('vibrate' in navigator) {
         const duration = intensity === 'light' ? 10 : 50;
         navigator.vibrate(duration);
       }
     };
   };
   ```

2. Apply to interactions:
   - Button taps (light vibration, ~10ms)
   - Deletions (medium vibration, ~30ms)
   - Confirmations (light vibration)
   - Form submissions (light vibration)

3. Feature detection:
   - Check `'vibrate' in navigator` before using
   - Graceful fallback: no error if unsupported

4. Accessibility:
   - Respect `prefers-reduced-motion` (don't vibrate if user disabled)

**Step 4: Audit Active/Press States (MOB-304)**

Review all components for mobile-friendly feedback:

1. Audit checklist:
   - [ ] All buttons have `:active` state (not just `:hover`)
   - [ ] All links have `:active` state
   - [ ] All list items have `:active` state
   - [ ] List items don't use hover-only styling

2. Common fixes:
   - Add active state to Button component:
     ```css
     button:active {
       opacity: 0.8;
       transform: scale(0.98);
     }
     ```
   - Remove hover-only styles on mobile:
     ```css
     @media (hover: none) {
       /* Remove hover styles for touch devices */
     }
     ```

3. Ensure visible feedback:
   - Color change (opacity, brightness)
   - Scale change (slight shrink on press)
   - Highlight/background change
   - Any obvious visual change that signals interaction

**Step 5: Optimize for 60fps (MOB-305)**

Ensure animations perform smoothly:

1. Profiling:
   - Open Chrome DevTools
   - Performance tab
   - Record animation (swipe, pull-to-refresh, etc.)
   - Check frame rate: target 60fps

2. Common optimizations:
   - Use CSS transforms instead of layout properties (top, left, width)
   - Use `will-change` CSS property for heavy animations
   - Debounce frequent updates (scroll, resize)
   - Lazy-load heavy assets

3. DevTools verification:
   - Record 3-5 seconds of interaction
   - Check frames per second in Performance tab
   - Modern devices (iPhone 12+): should see 60fps
   - Older devices (iPhone SE): 30fps acceptable

### Known Gotchas

**Gotcha 1: Swipe Gesture Conflicts with Browser Back**
- iOS Safari has native swipe-right-to-go-back gesture
- Custom swipe handler can interfere with or override browser gesture
- **Solution**: Test carefully on real device; ensure custom gesture doesn't break browser back button

**Gotcha 2: Pull-to-Refresh at Top of Scrollable Content**
- Pull-to-refresh must only trigger when already scrolled to top
- If implemented incorrectly, can trigger while scrolling through content
- **Solution**: Check scroll position (scrollTop === 0) before enabling pull gesture

**Gotcha 3: Haptic Feedback Not Available on All Devices**
- Older devices, Android devices, some iOS devices may not support Vibration API
- Feature detection essential
- **Solution**: Always feature-detect, handle gracefully if unavailable

**Gotcha 4: prefers-reduced-motion Must Be Respected**
- iOS users can disable animations and motion effects in Settings
- Apps should respect this preference (accessibility requirement)
- **Solution**: Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`; skip animations if true

**Gotcha 5: Animation Performance on Older Devices**
- iPhone SE (older) may not achieve 60fps with complex animations
- Jank (dropped frames) creates bad UX
- **Solution**: Profile on actual iPhone SE, simplify animations if needed, 30fps acceptable fallback

**Gotcha 6: Multiple Rapid Taps Triggering Multiple Actions**
- Rapid taps can trigger handler multiple times before UI updates
- Can cause duplicate submissions, multiple navigation events, etc.
- **Solution**: Debounce tap handlers (e.g., prevent interaction for 500ms after tap)

### Development Setup

**Tools Needed**:
- Gesture library: Hammer.js or custom
- Pull-to-refresh library (optional) or custom component
- Chrome DevTools Performance tab
- Real iOS device for gesture and haptic testing

**Testing Tools**:
- Chrome DevTools: Performance profiling, animation recording
- iOS Safari DevTools: Real device debugging
- BrowserStack: Device farm with haptic feedback testing (limited)

---

## Blockers

### Active Blockers

| ID | Title | Severity | Blocking | Resolution |
|----|-------|----------|----------|-----------|
| BLOCKER-301-001 | Phase 2 MOB-202 must complete before Phase 3 begins | high | All MOB-3xx tasks | Ensure Phase 2 quality gates passed |

### Resolved Blockers

N/A (Phase 3 hasn't started)

---

## Dependencies

### External Dependencies

- **Gesture Library**: Hammer.js or custom implementation
- **Pull-to-Refresh Library** (optional): `react-pull-to-refresh` or custom
- **Vibration API**: Built into Web APIs (iOS 13+, Android)
- **Chrome DevTools**: Performance profiling

### Internal Integration Points

- **React Router**: Navigation from swipe-back gesture
- **React Query**: Refetch/invalidate cache for pull-to-refresh
- **Button/Input components**: Active/press state styling
- **All interactive elements**: Haptic feedback on interactions

### Inter-Phase Dependencies

**Phase 3 depends on**:
- Phase 1 (MOB-107) complete
- Phase 2 (MOB-202) complete

**Phases 4-5 can run in parallel with Phase 3** (independent):
- Phase 4 (PWA) independent of gestures
- Phase 5 (Advanced UX) uses gestures from Phase 3

---

## Testing Strategy

### Unit Tests

- Gesture detection (swipe right detection logic)
- Pull-to-refresh trigger (scroll position + pull distance)
- Haptic feedback feature detection
- Active state calculation

### Integration Tests

- Swipe-back navigation: swipe → back navigation works
- Pull-to-refresh: pull → refetch → success state
- Haptic on button tap: tap → vibration
- Active state on list item: tap → visual feedback

### E2E Tests (Playwright)

```gherkin
Scenario: Swipe-back navigation
  When I navigate to detail page
  And I swipe right
  Then I return to previous page
  And animation is smooth
  And no jank or stuttering

Scenario: Pull-to-refresh on list
  When I pull down on list
  Then visual indicator appears
  And spinner shows during refresh
  And list data updates
  And success feedback shown

Scenario: Button tap with haptic feedback
  When I tap a button on iOS device with haptics
  Then button shows active state
  And device vibrates lightly
  And action triggers normally

Scenario: Active state on tap
  When I tap a list item
  Then item shows active state (highlight, color change)
  And state clears when released
  And navigation works on second tap

Scenario: Animations smooth at 60fps
  When I perform gesture animation
  Then Chrome DevTools shows 60fps
  And no dropped frames
  And animation smooth and responsive
```

### Device Testing Matrix

| Device | OS | Gestures | Haptics | 60fps | Notes |
|--------|----|----|---|---|---|
| iPhone SE | iOS 17 | Test | Test | 30fps acceptable | Baseline, older device |
| iPhone 12 | iOS 17 | Test | Test | 60fps target | Modern, standard |
| iPhone 14 Pro | iOS 17 | Test | Test | 60fps target | Latest, high-performance |

**Required Testing**:
- [ ] Swipe-back gesture works on detail pages (not conflicting with browser back)
- [ ] Pull-to-refresh appears and refreshes data
- [ ] Haptic feedback vibrates on iOS devices
- [ ] Button taps show active state immediately
- [ ] Animations perform at 60fps on modern devices
- [ ] No animation stuttering or jank
- [ ] Respects prefers-reduced-motion setting

### Performance Testing

- **Chrome DevTools**: Record gestures, verify 60fps
- **Real device**: Test haptic feedback on actual iPhone
- **Slow network**: Test pull-to-refresh behavior with throttled network

---

## Next Session Agenda

### Immediate Actions (When Phase 3 Begins)

1. [ ] **MOB-301**: Implement swipe-right gesture for back navigation
2. [ ] **MOB-302**: Add pull-to-refresh component to lists/dashboard
3. [ ] **MOB-303**: Integrate haptic feedback on interactions
4. [ ] **MOB-304**: Audit and fix active/press states
5. [ ] **MOB-305**: Verify animations at 60fps, optimize if needed

### Parallelization Opportunity

Tasks 1-4 (MOB-301 through MOB-304) can run in parallel after Phase 2 completes. Task 5 (MOB-305) depends on MOB-301 completion.

### Context for Continuing Agent

Phase 3 adds iOS-native feel through gestures and haptics. The primary challenges are:

1. **Gesture library selection**: Choose right tool (Hammer.js vs custom vs React library)
2. **Browser conflict**: Swipe-back gesture must not interfere with browser's native gesture
3. **Pull-to-refresh UX**: Must be intuitive, not trigger accidentally while scrolling
4. **Haptic compatibility**: Must feature-detect and gracefully fallback
5. **Performance**: Animations must be smooth; profile on real devices

The phase is complete when all 10 success criteria are met and Phase 3 quality gates pass.

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

- **Phase 1-2 Progress**: `.claude/progress/mobile-first-redesign/phase-[1-2]-progress.md`
- **Phase 4-5 Progress**: `.claude/progress/mobile-first-redesign/phase-[4-5]-progress.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Context**: `.claude/worknotes/mobile-first-redesign/context.md`
- **Web Patterns**: `apps/web/CLAUDE.md`
