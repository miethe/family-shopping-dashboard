---
# === PROGRESS TRACKING: PHASE 2 ===
# Mobile Navigation & Layout Overhaul - Task orchestration for AI agents

type: progress
prd: "mobile-first-redesign"
phase: 2
title: "Mobile Navigation & Layout Overhaul"
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
owners: ["ui-engineer-enhanced", "frontend-developer"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "MOB-201"
    description: "Complete bottom navigation (5 tabs) - Dashboard, People, Occasions, Lists, More menu"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced", "frontend-developer"]
    dependencies: ["MOB-107"]
    estimated_effort: "2h"
    priority: "high"

  - id: "MOB-202"
    description: "Responsive page layouts (mobile-first stacking) - all pages single-column on <768px, multi-column on ≥768px"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-201"]
    estimated_effort: "2h"
    priority: "high"

  - id: "MOB-203"
    description: "Touch-friendly forms & inputs - 44px+ input height, large submit button, mobile-optimized spacing"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-202"]
    estimated_effort: "2h"
    priority: "high"

  - id: "MOB-204"
    description: "Mobile-responsive modals/dialogs - 90% width on mobile, max-width 540px, scrollable content, close button always accessible"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-203"]
    estimated_effort: "1.5h"
    priority: "high"

  - id: "MOB-205"
    description: "Tablet optimization (iPad portrait/landscape) - ensure multi-column grids work in both orientations"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-204"]
    estimated_effort: "1.5h"
    priority: "high"

# Parallelization Strategy
parallelization:
  batch_1: ["MOB-201"]
  batch_2: ["MOB-202"]
  batch_3: ["MOB-203"]
  batch_4: ["MOB-204", "MOB-205"]
  critical_path: ["MOB-201", "MOB-202", "MOB-203", "MOB-204", "MOB-205"]
  estimated_total_time: "5-7 days"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Bottom navigation 5 tabs all functional"
    status: "pending"
  - id: "SC-2"
    description: "Bottom nav active state clearly indicates current page"
    status: "pending"
  - id: "SC-3"
    description: "All pages single-column on mobile, multi-column on tablet"
    status: "pending"
  - id: "SC-4"
    description: "Forms work without excessive scrolling on mobile"
    status: "pending"
  - id: "SC-5"
    description: "Modals properly sized and don't overflow"
    status: "pending"
  - id: "SC-6"
    description: "Tablet layouts tested on actual iPad"
    status: "pending"
  - id: "SC-7"
    description: "No horizontal scroll on main content (except carousels)"
    status: "pending"
  - id: "SC-8"
    description: "Lighthouse mobile score ≥90"
    status: "pending"
  - id: "SC-9"
    description: "E2E: Navigate all tabs, verify content loads correctly"
    status: "pending"
  - id: "SC-10"
    description: "No critical issues on devices"
    status: "pending"

# Files Modified
files_modified:
  - "apps/web/components/shared/MobileNav.tsx"
  - "apps/web/app/dashboard/page.tsx"
  - "apps/web/app/people/page.tsx"
  - "apps/web/app/occasions/page.tsx"
  - "apps/web/app/lists/page.tsx"
  - "apps/web/components/ui/dialog.tsx"
  - "apps/web/components/forms/*.tsx"
---

# Mobile-First Redesign - Phase 2: Mobile Navigation & Layout Overhaul

**Phase**: 2 of 5
**Status**: 🔵 Planning (0% complete)
**Duration**: Target 5-7 working days (can run parallel with Phases 3-4 after Phase 1)
**Owner**: ui-engineer-enhanced, frontend-developer
**Contributors**: None

---

## Orchestration Quick Reference

> For orchestration agents: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (First after Phase 1 complete):
- MOB-201 → `ui-engineer-enhanced` + `frontend-developer` (2h)

**Batch 2** (Depends on MOB-201):
- MOB-202 → `frontend-developer` (2h) - **Blocked by**: MOB-201

**Batch 3** (Depends on MOB-202):
- MOB-203 → `ui-engineer-enhanced` (2h) - **Blocked by**: MOB-202

**Batch 4** (Can run parallel after MOB-203):
- MOB-204 → `ui-engineer-enhanced` (1.5h) - **Blocked by**: MOB-203
- MOB-205 → `frontend-developer` (1.5h) - **Blocked by**: MOB-204 (MOB-205 includes MOB-204 in its testing scope)

**Critical Path**: MOB-201 → MOB-202 → MOB-203 → MOB-204 → MOB-205 (9 hours sequential)

### Task Delegation Commands

```
# Batch 1 - Launch after Phase 1 complete (MOB-107 done)
Task("ui-engineer-enhanced frontend-developer", "MOB-201: Complete bottom navigation with 5 functional tabs (Dashboard, People, Occasions, Lists, More). Implement active state, icons + labels, responsive sizing. All tabs navigable.")

# Batch 2 - After MOB-201 complete
Task("frontend-developer", "MOB-202: Refactor all page layouts for mobile-first stacking. Single column <768px, multi-column ≥768px. Dashboard, People, Occasions, Lists pages responsive. Test on real devices.")

# Batch 3 - After MOB-202 complete
Task("ui-engineer-enhanced", "MOB-203: Audit and optimize all forms (gift creation, person edit). Ensure 44px+ input height, large submit button, mobile-optimized spacing. Test with iOS keyboard visible.")

# Batch 4 - After MOB-203 complete (can start MOB-204 & MOB-205 in parallel)
Task("ui-engineer-enhanced", "MOB-204: Audit all modals/dialogs. Ensure 90% width on mobile, max-width 540px, scrollable content. Close button always accessible, not covered by keyboard.")

Task("frontend-developer", "MOB-205: Test and optimize for tablet (iPad portrait/landscape). Multi-column grids work in both orientations. No layout issues. Actual iPad testing required.")
```

---

## Overview

**Phase 2 Mission**: Build on Phase 1's foundation to make the app navigable and usable across all pages.

**Why This Phase**: Phase 1 fixed critical blockers (sidebar, viewport, touch targets), but the app isn't fully navigable yet. Phase 2 completes bottom navigation, responsive page layouts, and mobile-optimized forms and modals.

**Scope**:
- **IN SCOPE**: Complete bottom navigation (5 tabs), responsive page layouts (stacking on mobile), touch-friendly forms, responsive modals, tablet optimization
- **OUT OF SCOPE**: Gestures/interactions (Phase 3), PWA features (Phase 4), advanced UX (Phase 5)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Bottom navigation 5 tabs all functional | ⏳ Pending |
| SC-2 | Bottom nav active state clearly indicates current page | ⏳ Pending |
| SC-3 | All pages single-column on mobile, multi-column on tablet | ⏳ Pending |
| SC-4 | Forms work without excessive scrolling on mobile | ⏳ Pending |
| SC-5 | Modals properly sized and don't overflow | ⏳ Pending |
| SC-6 | Tablet layouts tested on actual iPad | ⏳ Pending |
| SC-7 | No horizontal scroll on main content (except carousels) | ⏳ Pending |
| SC-8 | Lighthouse mobile score ≥90 | ⏳ Pending |
| SC-9 | E2E: Navigate all tabs, verify content loads correctly | ⏳ Pending |
| SC-10 | No critical issues on devices | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| MOB-201 | Complete bottom navigation (5 tabs) | ⏳ | ui-engineer-enhanced, frontend-developer | MOB-107 | 2h | Dashboard, People, Occasions, Lists, More |
| MOB-202 | Responsive page layouts (mobile-first stacking) | ⏳ | frontend-developer | MOB-201 | 2h | Single-column mobile, multi-column tablet |
| MOB-203 | Touch-friendly forms & inputs | ⏳ | ui-engineer-enhanced | MOB-202 | 2h | 44px+ inputs, large buttons, iOS keyboard tested |
| MOB-204 | Mobile-responsive modals/dialogs | ⏳ | ui-engineer-enhanced | MOB-203 | 1.5h | 90% width mobile, 540px max, scrollable |
| MOB-205 | Tablet optimization (iPad portrait/landscape) | ⏳ | frontend-developer | MOB-204 | 1.5h | Multi-column grids, both orientations |

**Status Legend**: `⏳` Pending | `🔄` In Progress | `✓` Complete | `🚫` Blocked | `⚠️` At Risk

---

## Architecture Context

### Current State

**Navigation Structure**:
- **Desktop**: Sidebar-based navigation (DesktopNav)
- **Mobile**: Bottom navigation stub (MobileNav) exists but incomplete
- **Current Issue**: MobileNav not fully wired to all pages, no active state styling

**Page Layouts**:
- **Desktop**: Multi-column grids, sidebars, full-width content
- **Mobile**: Responsive breakpoints exist but not consistently applied across all pages
- **Current Issue**: Some pages still use desktop-first layouts, not mobile-first

**Form Components**:
- **Existing**: Button, Input, TextArea, Select, Dialog components (Radix UI based)
- **Current Issue**: Not optimized for mobile; input heights may be <44px, spacing cramped

**Modal Components**:
- **Existing**: Dialog component (Radix UI)
- **Current Issue**: May not be mobile-responsive; could overflow on small screens

### Reference Patterns

**Mobile-First Layout Pattern** (established in Phase 1):
```
Mobile (<768px):
- Single column stacking
- Full-width content
- Header top (sticky)
- Bottom nav (fixed)

Tablet (768-1024px):
- 2-3 column grids where appropriate
- Responsive sidebar drawer (optional)
- Maintain bottom nav or add top nav

Desktop (>1024px):
- Full layouts, sidebars, multi-column grids
```

**Component Sizing** (established in Phase 1):
- Touch targets: ≥44x44px minimum
- Input height: 44px minimum
- Button height: 44px minimum
- Spacing: 16px minimum gaps on mobile

---

## Implementation Details

### Technical Approach

**Step 1: Complete Bottom Navigation (MOB-201)**

Current state: `MobileNav.tsx` stub exists but not fully implemented.

Changes needed:
1. Implement 5 tabs: Dashboard, People, Occasions, Lists, More (menu)
2. Add icons for each tab (use existing icon library)
3. Add tab labels (visible on mobile, may be hidden on desktop with Tailwind)
4. Wire to React Router: clicking tab navigates to corresponding page
5. Implement active state: visually highlight current page tab
6. Ensure tab height ≥44px (touch-friendly)
7. Position: fixed bottom with safe area padding (from Phase 1)

**Step 2: Responsive Page Layouts (MOB-202)**

Apply mobile-first responsive design to all pages:

Pages to update:
- Dashboard (`apps/web/app/dashboard/page.tsx`)
- People (`apps/web/app/people/page.tsx`)
- Occasions (`apps/web/app/occasions/page.tsx`)
- Lists (`apps/web/app/lists/page.tsx`)
- Other pages with significant layouts

For each page:
1. Review desktop layout (multi-column grid, sidebars, etc.)
2. Create mobile-first stacking: single column on <768px
3. Use Tailwind responsive utilities: `md:` for desktop breakpoint
4. Test on mobile, tablet, desktop viewports
5. Ensure no horizontal scroll on main content

Example pattern:
```jsx
// Mobile-first: single column by default
// Desktop: grid with multiple columns
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>
```

**Step 3: Touch-Friendly Forms (MOB-203)**

Audit all forms in the app:

Forms to review:
- Gift creation form
- Gift edit form
- Person add/edit form
- List creation/edit form
- Any modal forms (settings, filters, etc.)

For each form:
1. Audit input heights: ensure ≥44px
2. Audit button heights: ensure ≥44px
3. Audit spacing between fields: ensure ≥16px
4. Test with iOS soft keyboard visible (ensure inputs scroll into view)
5. Test on iPhone SE (smallest screen) to ensure no overflow
6. Test label readability on mobile (14px+ font size)

Common issues to fix:
- Inputs <44px high (use `h-12` or larger in Tailwind)
- Submit button text too small (use `text-lg` or similar)
- Input labels cramped or overlapping
- Buttons too close together (add gap between)

**Step 4: Mobile-Responsive Modals (MOB-204)**

Audit Dialog/Modal components used throughout app:

Checklist:
1. Modal width on mobile: 90% of viewport (use `max-w-xs` or `max-w-sm`)
2. Modal max-width: 540px (use `max-w-lg`)
3. Modal content scrollable if too tall
4. Close button always accessible (not covered by keyboard)
5. Backdrop/overlay visible and tappable to dismiss
6. Test on iPhone with open keyboard (ensure form fits)

Example pattern:
```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="w-[90vw] max-w-lg">
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

**Step 5: Tablet Optimization (MOB-205)**

Test and optimize for iPad:

Breakpoints to verify:
- iPad portrait: 768px (md breakpoint)
- iPad landscape: 1024px+ (lg breakpoint)
- iPad Pro: 1280px+ (xl breakpoint)

For each page:
1. Test on actual iPad (if available) or iPad Pro viewport in browser
2. Verify multi-column grids render correctly
3. Ensure no horizontal scroll on main content
4. Test navigation and forms on larger screen
5. Optimize for landscape orientation
6. Ensure sidebar (if used) doesn't interfere

### Known Gotchas

**Gotcha 1: iOS Soft Keyboard Covering Inputs**
- When user taps an input field on iOS, the soft keyboard appears
- Keyboard may cover the input field and submit button
- Must scroll form so focused input is visible above keyboard
- **Solution**: Use `input.scrollIntoView()` on focus, or use a form library that handles this automatically

**Gotcha 2: Bottom Nav Overlapping Content**
- If bottom nav is fixed and not accounted for in layout, content scrolls under it
- Must add bottom padding to main content area equal to nav height + safe area
- **Solution**: Add `pb-20` (or similar) to main content wrapper, adjust for actual nav height

**Gotcha 3: Modal Closing on Background Tap (Unintentional)**
- Radix Dialog allows dismissing by clicking outside (backdrop)
- On mobile, accidental taps while scrolling form can close modal
- **Solution**: Set `onOpenChange` carefully, or use `onPointerDown` with checks

**Gotcha 4: Form Labels and Inputs Not Aligned on Mobile**
- Desktop forms often have labels on left, inputs on right (horizontal layout)
- On mobile (small viewport), this layout breaks and labels/inputs overlap or wrap poorly
- **Solution**: Use vertical label-over-input layout on mobile (`flex flex-col`)

**Gotcha 5: Tab Navigation Hiding Labels**
- Bottom nav tabs can be icon-only to save space, or icon + label
- Icon-only tabs may confuse users; labels should be visible or in tooltip
- **Solution**: Use `md:hidden` to show labels on mobile, hide on desktop (if needed to save space)

**Gotcha 6: Responsive Grid Changes on Scroll**
- Tailwind responsive utilities can cause grid column count to change mid-scroll if viewport resizes
- Not common but can happen on device rotation
- **Solution**: Test landscape orientation thoroughly, ensure grids are stable

### Development Setup

**Tools Needed**:
- Tailwind CSS (already in use)
- Real iOS device for testing (iPhone SE, iPad)
- Browser DevTools for responsive testing
- Lighthouse for performance verification

**Testing Viewports**:
- Mobile: 375px (iPhone SE), 390px (iPhone 12), 428px (iPhone 14 Pro Max)
- Tablet: 768px (iPad), 810px (iPad 10.9"), 1024px (iPad Pro landscape)
- Desktop: 1280px+

---

## Blockers

### Active Blockers

| ID | Title | Severity | Blocking | Resolution |
|----|-------|----------|----------|-----------|
| BLOCKER-201-001 | Phase 1 (MOB-107) must complete before Phase 2 begins | high | All MOB-2xx tasks | Ensure Phase 1 quality gates passed |

### Resolved Blockers

N/A (Phase 2 hasn't started)

---

## Dependencies

### External Dependencies

- **Tailwind CSS**: Already configured, responsive utilities available
- **Radix UI**: Dialog, Button, Input components already available
- **React Router**: Navigation between tabs using Next.js App Router
- **iOS/iPad**: Real devices for testing optimal UX

### Internal Integration Points

- **MobileNav component**: Central navigation, must be fully implemented
- **Page components**: All must apply responsive layouts
- **Form components**: Must be audited and resized for mobile
- **Modal/Dialog wrapper**: Must be responsive and mobile-friendly

### Inter-Phase Dependencies

**Phase 2 depends on**:
- Phase 1 (MOB-107) complete and quality gates passed

**Phases 3-5 can run in parallel with Phase 2** (independent):
- Phase 3 (Gestures) enhances Phase 2 navigation
- Phase 4 (PWA) independent of navigation
- Phase 5 (Advanced UX) enhances Phase 2 layouts with animations

---

## Testing Strategy

### Unit Tests

- Bottom nav tab active state computation
- Responsive breakpoint utility functions
- Form input size and spacing validation

### Integration Tests

- MobileNav routing: clicking each tab navigates to correct page
- Page layouts: content renders correctly at all breakpoints
- Form submission: forms submit correctly with mobile input values
- Modal dismissal: can close with button or backdrop tap

### E2E Tests (Playwright)

```gherkin
Scenario: Bottom navigation navigates between pages
  When I tap "People" tab
  Then People page loads
  And "People" tab is marked active (highlighted)
  And "Dashboard" tab is not highlighted

Scenario: Single-column layout on mobile
  When I view Dashboard on mobile viewport (375px)
  Then content stacks in single column
  And no horizontal scroll visible
  And all content visible by scrolling vertically

Scenario: Multi-column layout on tablet
  When I view Dashboard on tablet viewport (768px)
  Then content renders in multiple columns
  And layout responsive to width

Scenario: Forms on mobile
  When I open gift creation form on mobile
  Then all inputs are at least 44px high
  And labels are readable (14px+)
  And submit button is easily tappable
  And form doesn't overflow horizontally

Scenario: Modal on mobile
  When I open modal on mobile
  Then modal is 90% width of screen
  And close button always visible
  And can scroll content if too tall
  And modal doesn't get covered by keyboard

Scenario: Bottom nav doesn't cover content
  When I scroll to bottom of list on mobile
  Then last item is visible above bottom nav
  And bottom nav doesn't overlay content
```

### Device Testing Matrix

| Device | Viewport | Portrait | Landscape | Tabs | Forms | Modals |
|--------|----------|----------|-----------|------|-------|--------|
| iPhone SE | 375×667 | ✓ | ✓ | Test | Test | Test |
| iPhone 12 | 390×844 | ✓ | ✓ | Test | Test | Test |
| iPad (10th gen) | 810×1080 | ✓ | ✓ | Test | Test | Test |
| iPad (landscape) | 1024×768 | - | ✓ | Test | Test | Test |

**Required Testing**:
- [ ] All 5 bottom nav tabs navigate correctly
- [ ] Active tab highlighted on each page
- [ ] Single-column layout on mobile (375px width)
- [ ] Multi-column layout on tablet (768px+ width)
- [ ] No horizontal scroll on main content
- [ ] Forms fully visible on mobile without keyboard overlap
- [ ] Modals sized correctly, content scrollable if needed
- [ ] All tested on real devices or high-fidelity viewport simulation

### Performance Testing

- **Lighthouse**: Target 90+ mobile performance score
- **Navigation timing**: Measure time to navigate between tabs
- **Layout shift**: Ensure no CLS (Cumulative Layout Shift) when navigating

### Accessibility Testing

- **Keyboard navigation**: Tab between form fields (on desktop)
- **Screen reader**: VoiceOver on iOS should read all content
- **Touch targets**: All buttons, tabs, form fields ≥44x44px
- **Color contrast**: All text ≥4.5:1 ratio
- **Focus indicators**: Visible when navigating with keyboard or voice control

---

## Next Session Agenda

### Immediate Actions (When Phase 2 Begins)

1. [ ] **MOB-201**: Complete bottom navigation with 5 functional tabs, active state, routing
2. [ ] **MOB-202**: Apply responsive layouts to all pages (single-column mobile, multi-column tablet)
3. [ ] **MOB-203**: Audit and optimize forms for mobile (44px inputs, large buttons, iOS keyboard aware)
4. [ ] **MOB-204**: Ensure modals are mobile-responsive (90% width, scrollable, close button accessible)
5. [ ] **MOB-205**: Test and optimize for iPad in portrait and landscape

### Dependency Chain

Phase 2 must follow this sequence:
1. MOB-201 completes (enables navigation)
2. MOB-202 starts (depends on navigation working)
3. MOB-203 starts (forms can now be tested)
4. MOB-204, MOB-205 run in parallel (independent from earlier tasks)

### Context for Continuing Agent

Phase 2 is the first major user-facing work after Phase 1's foundation. The primary challenges are:

1. **Bottom nav wiring**: Must route correctly to all pages and show active state
2. **Responsive layouts**: All pages must handle mobile/tablet/desktop viewports
3. **Form optimization**: Must account for iOS soft keyboard and small screens
4. **Modal sizing**: Must not overflow and must be easily dismissible
5. **Device testing**: Real device testing essential to verify mobile UX

The phase is complete when all 10 success criteria are met and Phase 2 quality gates pass.

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

- **Phase 1 Progress**: `.claude/progress/mobile-first-redesign/phase-1-progress.md`
- **Phase 3-5 Progress**: `.claude/progress/mobile-first-redesign/phase-[3-5]-progress.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Context**: `.claude/worknotes/mobile-first-redesign/context.md`
- **Web Patterns**: `apps/web/CLAUDE.md`
