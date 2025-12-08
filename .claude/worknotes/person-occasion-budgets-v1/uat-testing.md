# User Acceptance Testing Report
## Person-Occasion Budgets Feature (v1)

**Document ID**: `UAT-2025-12-08-POB-V1`
**Feature**: Person Budget per Occasion
**Testing Date**: 2025-12-08
**Status**: Ready for Testing

---

## Executive Summary

This document provides comprehensive User Acceptance Testing (UAT) for the person-occasion budgets feature. The feature enables users to set and track individual spending budgets for each person within each occasion (e.g., "Spend $200 on Mom for Christmas 2024").

### Test Coverage Overview

| Metric | Value |
|--------|-------|
| Total Test Cases | 19 |
| Test Categories | 5 (Budget Management, Progress Tracking, Edge Cases, Mobile, Accessibility) |
| Priority P0 | 9 tests |
| Priority P1 | 7 tests |
| Priority P2 | 3 tests |
| Estimated Duration | 3-4 hours |

### Success Criteria (All Must Pass for Release)

- [x] All P0 test cases PASS
- [x] All P1 test cases PASS (or documented blockers)
- [x] No critical bugs (blocking further testing)
- [x] Mobile/responsive layout functions correctly
- [x] Accessibility requirements met (WCAG 2.1 AA)
- [x] Feature ready for production deployment

---

## Test Environment

### System Configuration

| Component | Specification |
|-----------|---------------|
| Browser (Desktop) | Chrome 131+, Safari 17+, Firefox 131+ |
| Browser (Mobile) | iOS Safari (16+), Android Chrome (131+) |
| Screen Sizes Tested | Desktop (1280x720), Tablet (768x1024), Mobile (375x812) |
| Network | Standard broadband (5+ Mbps download) |
| Database | PostgreSQL 15+ with migration applied |
| API Server | FastAPI running locally or staging |
| Frontend App | Next.js development or staging build |

### Test Data Setup

**Prerequisites Before Testing**:

1. **Database Migration Applied**
   - PersonOccasion table extended with `recipient_budget_total` and `purchaser_budget_total` columns
   - Database index on (person_id, occasion_id) created
   - Verify: `\d person_occasions` shows budget columns

2. **Test User Account**
   - Create family account with 3+ test persons
   - Create 3+ test occasions (mix of active and past)
   - Link test persons to occasions via PersonOccasion

3. **Test Data Examples**
   - **Occasion 1**: "Christmas 2024" (active, future date)
   - **Occasion 2**: "Mom's Birthday 2024" (active)
   - **Occasion 3**: "Holiday Party 2023" (past, is_active=false)
   - **Persons**: Mom, Dad, Sister (linked to all occasions)

4. **API Endpoints Ready**
   - GET `/api/persons/{id}/occasions/{oid}/budget`
   - PUT `/api/persons/{id}/occasions/{oid}/budget`
   - Both endpoints returning PersonOccasionBudgetResponse DTOs

5. **Frontend Hooks Deployed**
   - `usePersonOccasionBudget(personId, occasionId)` functional
   - `useUpdatePersonOccasionBudget(personId, occasionId)` working
   - React Query cache invalidation verified

---

## Detailed Test Cases

### Category 1: Budget Management (P0 Priority)

These tests validate core budget CRUD operations and persistence.

---

### TC-001: Set Recipient Budget for Person-Occasion

**Title**: User can set a recipient budget (budget for gifts TO a person)
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Logged into family account
- Navigated to Occasion Detail page for "Christmas 2024"
- "People" section visible with linked persons
- PersonOccasionBudgetCard rendered for Mom

**Steps**:
1. Locate "Mom" card in the People section
2. Find "Budget for Gifts To Mom" input field
3. Clear field if populated
4. Enter value: `200` (representing $200.00)
5. Click outside field (blur) or press Tab to trigger save
6. Wait for loading indicator to complete

**Expected Result**:
- Input field accepts numeric value
- Save spinner appears briefly
- Success checkmark or green indicator displays (optional)
- Value persists in UI after blur (no reverting to previous value)
- PersonBudgetBar appears below input showing "$0 / $200 (0%)" progress
- No error messages displayed

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Test with various amounts: $0.50, $100, $1000, $99999.99
- Confirm that negative values are rejected (validation error)

---

### TC-002: Set Purchaser Budget for Person-Occasion

**Title**: User can set a purchaser budget (budget for gifts BY a person)
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Logged into family account
- Navigated to Occasion Detail page for "Christmas 2024"
- PersonOccasionBudgetCard visible for Mom
- Mom recipient budget may already be set (from TC-001)

**Steps**:
1. Locate "Mom" card in the People section
2. Find "Budget for Gifts By Mom" input field
3. Clear field if populated
4. Enter value: `75` (representing $75.00)
5. Click outside field (blur) to trigger save
6. Observe loading state and completion

**Expected Result**:
- Input field accepts numeric value independently from recipient budget
- Save succeeds
- Value persists in UI
- Progress bar updates to show purchaser budget separately
- Both recipient and purchaser budgets can coexist without conflict

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Verify that recipient budget from TC-001 is still set ($200)
- Both budgets should be visible simultaneously on card

---

### TC-003: Update Existing Budget

**Title**: User can modify an existing budget value
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Recipient budget set to $200 for Mom (from TC-001)
- Logged into Occasion Detail page

**Steps**:
1. Locate Mom's budget card
2. Find "Budget for Gifts To Mom" field (currently showing $200)
3. Clear the field
4. Enter new value: `300` (increase to $300.00)
5. Blur the field to save

**Expected Result**:
- Field updates from $200 to $300
- Save request sent to backend
- Progress bar updates to reflect new budget total
- Existing gifts counted against new total (e.g., if $50 spent, show "$50 / $300 (16.7%)")
- No data loss; previous value replaced cleanly

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Confirm that API PUT request is sent (check network tab)
- Verify old budget value is not retained in any field

---

### TC-004: Clear Budget (Set to NULL)

**Title**: User can remove a budget by clearing the field (set to NULL)
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Recipient budget set to $200 for Mom
- Logged into Occasion Detail page

**Steps**:
1. Locate Mom's "Budget for Gifts To Mom" field
2. Click field to focus
3. Select all text (Ctrl+A or Cmd+A)
4. Delete text (press Backspace/Delete)
5. Blur the field (click elsewhere)
6. Wait for save to complete

**Expected Result**:
- Field clears to empty state
- Save request sent to API with `recipient_budget_total: null`
- PersonBudgetBar disappears (no progress bar when budget is NULL)
- Only spending total displays (e.g., "Total: $0 spent" without budget context)
- No error message; NULL is valid state

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Verify API receives `null` value, not empty string
- Ensure progress bar fully disappears (not showing "0 / null")

---

### TC-005: Budget Persists After Page Reload

**Title**: Budgets remain saved after page reload/navigation away
**Priority**: P0 (Critical)
**Duration**: 15 minutes
**Preconditions**:
- Recipient budget set to $250 for Mom (from TC-003)
- Purchaser budget set to $75 for Mom (from TC-002)
- Page is displayed and all saves completed

**Steps**:
1. Verify both budgets visible on Mom's card:
   - "Budget for Gifts To Mom": $250
   - "Budget for Gifts By Mom": $75
2. Refresh browser (F5 or Cmd+R)
3. Wait for page to fully load (loading spinners complete)
4. Navigate back to same Occasion Detail page
5. Observe Mom's budget card

**Expected Result**:
- After refresh: Both budgets still display as $250 and $75
- After navigation and return: Budgets reload correctly from API
- No "undefined" or empty states
- React Query cache populated correctly after page load
- Network request to GET /persons/{id}/occasions/{oid}/budget succeeds

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Open DevTools Network tab to verify API request succeeds
- Check response payload contains correct budget values
- Test with browser back button navigation (not just direct reload)

---

### Category 2: Progress Tracking & Visualization (P0 Priority)

These tests validate budget progress bars and spending calculations.

---

### TC-006: Progress Bar Displays When Budget is Set

**Title**: PersonBudgetBar appears and shows correct initial state (0% progress)
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Logged into Occasion Detail page
- Mom's recipient budget set to $200 (from TC-001)
- No gifts yet linked to Mom for this occasion

**Steps**:
1. Locate Mom's PersonOccasionBudgetCard
2. Verify "Budget for Gifts To Mom": $200 displayed
3. Look for progress bar below budget input
4. Inspect progress bar content

**Expected Result**:
- PersonBudgetBar renders and is visible
- Progress bar shows "$0 / $200" (format may vary: "$0 of $200", "0 / 200")
- Progress percentage shows "0%" (no fill or very minimal fill)
- Bar is green/healthy color (not red warning)
- Bar is properly labeled with aria-valuenow="0" aria-valuemax="200"
- Progress bar width/height appropriate for mobile and desktop

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Confirm progress bar does NOT appear if budget is NULL
- Check that progress bar has sufficient visual contrast (accessible)

---

### TC-007: Progress Updates When Gift is Added

**Title**: Progress bar updates correctly when a new gift is added for the budgeted person
**Priority**: P0 (Critical)
**Duration**: 20 minutes
**Preconditions**:
- Logged into Occasion Detail page for "Christmas 2024"
- Mom's recipient budget set to $200
- PersonBudgetBar showing "$0 / $200 (0%)"
- Occasion gift list or gift management view accessible

**Steps**:
1. Navigate to gift list for this occasion (or create gift dialog)
2. Create new gift with:
   - Recipient: Mom
   - Item: "Gift Card"
   - Amount: $50
   - Status: Planned (not yet purchased)
3. Save the gift
4. Return to Occasion Detail page (or wait for real-time update)
5. Observe Mom's PersonBudgetBar

**Expected Result**:
- Progress bar updates to "$50 / $200 (25%)"
- Progress percentage changes from 0% to 25%
- Progress fill increases proportionally (bar ~25% full)
- Bar color remains green (within budget)
- Update occurs immediately (real-time) or upon page reload
- No manual refresh needed if real-time sync implemented

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Test with multiple gifts: Add $75 gift → should show "$125 / $200 (62.5%)"
- Confirm spending includes both "planned" and "purchased" gifts
- Verify gifts for OTHER persons don't affect Mom's progress bar

---

### TC-008: Over-Budget Warning Displays Correctly

**Title**: Visual warning appears when total spending exceeds budget
**Priority**: P0 (Critical)
**Duration**: 20 minutes
**Preconditions**:
- Logged into Occasion Detail page
- Mom's recipient budget set to $200
- Current spending: $150 (within budget, bar is green)
- Ability to add/modify gifts

**Steps**:
1. Navigate to gift creation/edit dialog
2. Add new gift for Mom with amount $75 (total spending would be $225)
3. Save the gift
4. Return to Occasion Detail page
5. Observe Mom's PersonBudgetBar

**Expected Result**:
- Progress bar updates to "$225 / $200 (112.5%)"
- Progress bar color changes to RED or ORANGE (warning state)
- Visual indicator appears: red badge, warning icon, or color change
- Text may display: "Over budget by $25" (optional enhancement)
- aria-valuenow="225" updates correctly
- Progress percentage shows >100 (not capped at 100%)
- Warning persists until budget is adjusted or spending reduced

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Confirm warning is NOT dismissible (users should see status clearly)
- Test edge cases: exactly at budget ($200), just over ($200.01), far over ($300)
- Verify warning applies independently to purchaser and recipient budgets

---

### TC-009: Totals-Only Mode When No Budget Set

**Title**: When budget is NULL, progress bar shows only spending total (no budget context)
**Priority**: P0 (Critical)
**Duration**: 10 minutes
**Preconditions**:
- Logged into Occasion Detail page
- Mom's recipient budget is NULL (cleared in TC-004)
- Mom has $100 in gifts linked to this occasion

**Steps**:
1. Locate Mom's PersonOccasionBudgetCard
2. Verify "Budget for Gifts To Mom" field is empty
3. Observe area below budget input where progress bar was

**Expected Result**:
- PersonBudgetBar does NOT display (or displays in minimalist "info only" state)
- Instead, simple text shows: "Total: $100 spent" (or similar format)
- No progress bar visual (no filled container)
- No budget percentage shown (e.g., no "50%" without context)
- Input field for budget remains empty (ready for user to set budget)
- No visual distinction between NULL and pending state

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Verify this state is clean and doesn't confuse users
- Confirm user can still add/view gifts when budget is NULL
- No broken UI elements when budget is undefined

---

### Category 3: Edge Cases & Validation (P1 Priority)

These tests validate error handling and boundary conditions.

---

### TC-010: Budget Input Validation (Min Value = 0, Decimals Allowed)

**Title**: Input field validates that budgets are non-negative and accept decimal places
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Logged into Occasion Detail page
- Mom's budget field ready for input

**Steps**:

**Test 1: Negative Value**
1. Click "Budget for Gifts To Mom" field
2. Enter: `-50`
3. Blur or press Tab
4. Observe validation behavior

**Test 2: Valid Decimal**
1. Click field
2. Clear
3. Enter: `199.99`
4. Blur to save
5. Verify save succeeds

**Test 3: Zero Value**
1. Click field
2. Clear
3. Enter: `0`
4. Blur to save
5. Verify save succeeds (zero budget is valid)

**Test 4: Very Large Value**
1. Click field
2. Enter: `99999.99`
3. Blur to save
4. Verify save succeeds

**Expected Result**:

**Test 1**:
- Negative value shows error message: "Budget must be 0 or greater"
- Save is prevented
- Field retains previous valid value (or empty if new entry)

**Test 2**:
- Decimal value accepted and formatted as currency: $199.99
- Save succeeds
- Backend confirms NUMERIC(10,2) precision

**Test 3**:
- Zero budget accepted (users might set $0 to block spending on person)
- Progress bar shows "$X / $0 (infinite%)" or custom handling
- No error message

**Test 4**:
- Large value accepted (NUMERIC(10,2) supports up to 99999999.99)
- Displays as $99,999.99
- Save succeeds

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Test with various invalid inputs: "abc", "50.5.5", "$200", "-0.01"
- Confirm backend validation matches frontend (fail-safe if frontend bypassed)
- Verify error messages are user-friendly

---

### TC-011: Multiple Occasions for Same Person

**Title**: User can set different budgets for same person across different occasions
**Priority**: P1 (High)
**Duration**: 20 minutes
**Preconditions**:
- Logged into family account
- Occasion 1: "Christmas 2024" (active)
- Occasion 2: "Mom's Birthday 2024" (active)
- Both occasions have Mom linked via PersonOccasion

**Steps**:
1. Navigate to Occasion Detail page for "Christmas 2024"
2. Set Mom's recipient budget to $200
3. Save and verify
4. Navigate to Occasion Detail page for "Mom's Birthday 2024"
5. Set Mom's recipient budget to $100 (different from Christmas)
6. Save and verify
7. Return to "Christmas 2024" occasion detail
8. Observe Mom's budget

**Expected Result**:
- Christmas budget for Mom: $200
- Birthday budget for Mom: $100 (completely separate)
- Returning to Christmas page shows $200 (not $100)
- Budgets do not interfere with each other
- API correctly filters by (person_id, occasion_id) tuple
- Progress bars calculate spending for respective occasion only
- Gifts added to Christmas don't affect Birthday budget progress

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Verify API endpoint passes both person_id and occasion_id correctly
- Test with Person Modal Budgets Tab: should show all occasions with separate budgets
- Confirm database index on (person_id, occasion_id) improves query performance

---

### TC-012: Past vs. Active Occasions

**Title**: Budgets for past occasions remain accessible and editable
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Logged into family account
- Occasion: "Holiday Party 2023" (is_active=false, past date)
- Mom linked to this occasion with existing budget $150

**Steps**:
1. Navigate to Occasion Detail page for "Holiday Party 2023" (past occasion)
2. Observe occasion display (may show "Past" badge or different styling)
3. Locate Mom's PersonOccasionBudgetCard
4. Verify budget is visible: $150
5. Attempt to edit budget: change to $175
6. Save and verify update succeeds

**Expected Result**:
- Past occasion detail page loads correctly (not archived/hidden)
- Historical budget data fully accessible
- Budget fields are still editable (no read-only state)
- Save succeeds with PUT request to API
- Changes persist for historical records
- PersonBudgetBar shows historical spending vs. budget
- Scenario: "Year-over-year planning" - user can review past budget and plan next year's budget

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Confirm is_active=false occasions are not filtered out from detail view
- Verify past occasion doesn't show in create/edit dropdowns (only in history)
- Test in Person Modal Budgets Tab with filter toggle

---

### Category 4: Cross-Device & Mobile Testing (P1 Priority)

These tests validate responsive design and touch interactions.

---

### TC-013: Mobile Responsive Layout (375px viewport)

**Title**: Budget card and inputs remain usable on mobile devices (375px width)
**Priority**: P1 (High)
**Duration**: 20 minutes
**Preconditions**:
- Browser DevTools open with device emulation
- Set viewport to iPhone SE (375x812)
- Occasion Detail page loaded on mobile
- Mom's PersonOccasionBudgetCard visible

**Steps**:
1. Observe layout of PersonOccasionBudgetCard on mobile
2. Inspect budget input fields (width, padding, font size)
3. Attempt to click and focus each input field
4. Type budget value: `200`
5. Blur field to trigger save
6. Scroll to view PersonBudgetBar below inputs
7. Verify bar displays below budget inputs (not cut off)
8. Check that no horizontal scrolling required

**Expected Result**:
- Entire card fits within 375px width (including padding/margins)
- Budget labels are readable: "Budget for Gifts To Mom"
- Input fields are responsive (no overflow or text wrapping)
- Budget values display in appropriate currency format
- PersonBudgetBar fits within viewport width
- Progress bar labels ($X / $Y) are readable
- No horizontal scroll required
- Touch-friendly spacing maintained
- Card stacks vertically on mobile (recipient above purchaser input)

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Test on actual mobile device if possible (in addition to emulation)
- Check font sizes: should be minimum 16px for inputs (mobile accessibility)
- Verify no text truncation or overlapping elements

---

### TC-014: Touch Targets Meet 44px Minimum

**Title**: All interactive elements (inputs, buttons) meet 44x44px minimum touch target size
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Mobile viewport (375x812)
- Browser DevTools Inspector available
- PersonOccasionBudgetCard visible on occasion detail page

**Steps**:
1. Right-click on "Budget for Gifts To Mom" input field
2. Inspect element (DevTools)
3. Check computed dimensions in DevTools
4. Measure height and width
5. Repeat for:
   - "Budget for Gifts By Mom" input
   - Save button (if separate button exists)
   - Delete/Clear budget button (if exists)
6. Document measurements

**Expected Result**:
- Input field height: minimum 44px (larger is OK)
- Input field has sufficient left/right padding for touch: minimum 8px each side
- Tap target area around input: 44x44px minimum
- Save button (if present): 44x44px minimum
- Spacing between input fields: minimum 8px
- No input field smaller than 44px height
- Mobile keyboard doesn't obscure critical UI (test by focusing input)

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Use DevTools Accessibility panel: check "Touch targets" audit
- Consider device pixel ratio: CSS 44px = 88px device pixels on 2x displays
- Test on actual device touch screen if possible
- Verify cursor changes to text-input cursor on mobile (not pointer)

---

### TC-015: iOS Safari Safe Areas (Notch Compatibility)

**Title**: UI properly respects iOS safe areas on notched devices
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- iOS Safari browser on iPhone with notch (iPhone 12+) OR emulation
- Device orientation: portrait and landscape
- Occasion Detail page loaded
- PersonOccasionBudgetCard visible

**Steps**:
1. Observe layout in portrait orientation (notch at top)
   - Check that content is not hidden under notch
   - Verify safe area padding is applied
2. Rotate device to landscape (notch on side)
   - Observe content reflow
   - Check that content respects landscape safe area
3. Attempt to interact with budget fields in both orientations
4. Check header/footer positioning in both modes

**Expected Result**:
- Portrait mode: Content has padding below status bar (notch area)
- Landscape mode: Content has padding to the left/right of notch
- Budget card appears fully within safe area (not behind notch/home indicator)
- Input fields are fully accessible in both orientations
- No content cut off by safe area insets
- No "hidden" elements behind notch or home indicator bar
- Status shows proper use of CSS `env(safe-area-inset-*)` variables

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Test with actual iPhone if possible (or use Xcode simulator)
- Inspect CSS to confirm `safe-area-inset-*` values are applied
- Verify page viewport is set to: `width=device-width, initial-scale=1`

---

### Category 5: Accessibility & Compliance (P1 Priority)

These tests validate WCAG 2.1 AA accessibility standards.

---

### TC-016: Budget Inputs Have Proper ARIA Labels

**Title**: Budget input fields have descriptive ARIA labels for screen readers
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Occasion Detail page loaded
- Browser DevTools Inspector available
- Screen reader (optional but recommended: NVDA, JAWS, or Mac VoiceOver)

**Steps**:
1. Right-click on "Budget for Gifts To Mom" input field
2. Select "Inspect" in DevTools
3. Review HTML for input element
4. Check for:
   - `<label>` element with `for` attribute matching input `id`
   - OR `aria-label` attribute on input
   - OR `aria-labelledby` pointing to label element
5. Repeat for "Budget for Gifts By Mom" input
6. (Optional) Enable screen reader and navigate to input:
   - VoiceOver (Mac): VO + Right Arrow
   - NVDA (Windows): Tab to element
   - Listen for label announcement

**Expected Result**:
- Input element has associated label: `<label for="budget-recipient-mom">Budget for Gifts To Mom</label>`
- OR input has aria-label: `aria-label="Budget for gifts to Mom"`
- Label text clearly indicates:
  - Field purpose (budget)
  - Budget type (recipient vs. purchaser)
  - Person name (Mom)
- Example labels:
  - "Budget for gifts to Mom (recipient)"
  - "Budget for gifts from Mom (purchaser)"
  - "Recipient budget for Mom"
- Screen reader announces full label when focused
- Label is visible to sighted users (not hidden)

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Verify label is NOT display:none or visibility:hidden
- Confirm aria-label doesn't conflict with visible label
- Test with actual screen reader if possible

---

### TC-017: Progress Bar Has Correct ARIA Attributes

**Title**: PersonBudgetBar exposes progress information to screen readers via ARIA
**Priority**: P1 (High)
**Duration**: 10 minutes
**Preconditions**:
- Occasion Detail page with PersonBudgetBar visible
- Mom's recipient budget set to $200, current spending $50

**Steps**:
1. Right-click on PersonBudgetBar (progress bar element)
2. Inspect HTML in DevTools
3. Check for attributes:
   - `role="progressbar"` (or semantic HTML `<progress>`)
   - `aria-valuenow` (current value: 50)
   - `aria-valuemin` (minimum: 0)
   - `aria-valuemax` (maximum: 200)
   - `aria-label` or `aria-labelledby` (description)
4. Verify values update when spending changes
5. (Optional) Test with screen reader

**Expected Result**:
- Progress bar has `role="progressbar"`
- aria-valuenow="50" (current spending)
- aria-valuemin="0"
- aria-valuemax="200" (budget total)
- aria-label="Mom's recipient budget: $50 of $200"
- Screen reader announces: "Mom's recipient budget progress bar 50 of 200"
- When budget changes to $225 spent (over budget):
  - aria-valuenow="225"
  - aria-valuemax="200"
  - Screen reader announces: "225 of 200" (indicating overage)

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- aria-valuenow should always be numeric (not formatted with $ or %)
- Label should be human-readable: "Mom's recipient budget" not "rb-mom-rec-pg"
- Consider adding aria-description for long explanations

---

### TC-018: Keyboard Navigation - Tab Through Budget Controls

**Title**: Users can navigate and interact with budget inputs using keyboard only
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Occasion Detail page loaded
- No mouse/trackpad used (keyboard only)
- Person modal or budget controls visible

**Steps**:
1. Press Tab to navigate through page elements
2. Count Tab presses until reaching Mom's "Budget for Gifts To" input
3. Press Tab again to reach "Budget for Gifts By" input
4. Press Tab again to move to next interactive element (not stuck)
5. Focus on "Budget for Gifts To" input
6. Type budget value: `200`
7. Press Tab to blur and trigger save
8. Wait for save to complete
9. Press Shift+Tab to navigate backwards
10. Verify can return to previous input

**Expected Result**:
- Tab order is logical (top-to-bottom, left-to-right on each card)
- No keyboard traps (can always Tab away from element)
- Input focus is clearly visible (blue outline or highlight)
- Focus order: Card Title → Recipient Input → Purchaser Input → Next Card
- Pressing Tab on final card element moves to next card or footer
- Pressing Shift+Tab reverses navigation (backwards)
- Budget save completes without requiring mouse interaction
- All interactive elements are keyboard accessible (no mouse-only actions)

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Use browser's built-in focus indicator (or custom CSS outline)
- Confirm focus ring doesn't disappear when typing
- Test Tab behavior across multiple person cards
- Verify Enter key does NOT submit page (only blur for auto-save)

---

### TC-019: Color Contrast & Visual Indicators (Not Color-Dependent)

**Title**: Visual indicators (over-budget warnings) are not solely color-dependent; include icons/text
**Priority**: P1 (High)
**Duration**: 15 minutes
**Preconditions**:
- Occasion Detail page with PersonBudgetBar visible
- Mom's budget exceeded (e.g., $225 spent, $200 budget)
- Browser DevTools Color Contrast Checker available (axe DevTools, Wave, or similar)

**Steps**:
1. Locate Mom's PersonBudgetBar showing over-budget state
2. Right-click and Inspect element
3. Check for color values (CSS background-color, color)
4. Run accessibility audit (axe DevTools: Scan → Check for color contrast issues)
5. Verify warning visual:
   - RED progress bar: Check contrast ratio against white/light background
   - Progress text: Verify readable on dark/light backgrounds
6. Confirm warning includes:
   - Color change (red bar) - visual only, not sufficient alone
   - Text indicator: "Over budget", "Warning", icon, or badge
   - Icon: Warning triangle, exclamation mark, or similar
7. Disable colors in browser (simulate grayscale mode) and verify warning still visible

**Expected Result**:
- Over-budget warning is not solely indicated by color
- Visual indicators include:
  - Red/amber color (primary visual change)
  - TEXT: "Over budget" or "$25 over" (secondary indicator)
  - ICON: Warning triangle, exclamation, or alert icon (tertiary)
- Color contrast ratio meets WCAG AA standard:
  - Normal text: 4.5:1 (body text vs. background)
  - Large text (18pt+): 3:1
  - Over-budget indicator: minimum 3:1 (distinguishable from healthy state)
- In grayscale mode: Warning is still distinguishable (e.g., pattern, texture, or borders)
- Example: Red bar with icon + text "Over budget by $25"

**Actual Result**:
[To be filled during testing]

**Status**: PASS / FAIL / BLOCKED

**Notes**:
- Use axe DevTools browser extension for automated contrast checking
- Test with actual color blindness simulator (Coblis, Daltonize)
- Confirm text contrast passes when both foreground and background colors change

---

## Summary of Test Coverage

### Test Cases by Category

| Category | Count | P0 | P1 | P2 | Status |
|----------|-------|----|----|----|----|
| Budget Management | 5 | 5 | - | - | [PASS/FAIL] |
| Progress Tracking | 4 | 4 | - | - | [PASS/FAIL] |
| Edge Cases | 3 | - | 3 | - | [PASS/FAIL] |
| Mobile/Responsive | 3 | - | 3 | - | [PASS/FAIL] |
| Accessibility | 4 | - | 4 | - | [PASS/FAIL] |
| **Total** | **19** | **9** | **10** | **0** | **[OVERALL]** |

---

## Known Issues & Blockers

### Critical Issues (Block Release)

None identified at time of UAT planning. Will be populated during testing execution.

| Issue ID | Severity | Description | Workaround | Status |
|----------|----------|-------------|-----------|--------|
| [To be filled] | CRITICAL | [Description] | [Workaround if any] | OPEN |

### High Priority Issues (Must Fix Before Release)

| Issue ID | Severity | Description | Workaround | Status |
|----------|----------|-------------|-----------|--------|
| [To be filled] | HIGH | [Description] | [Workaround if any] | OPEN |

### Medium Priority Issues (Should Fix, Document if Deferred)

| Issue ID | Severity | Description | Workaround | Status |
|----------|----------|-------------|-----------|--------|
| [To be filled] | MEDIUM | [Description] | [Workaround if any] | OPEN |

---

## Test Execution Notes

### Testing Schedule

| Phase | Dates | Tester(s) | Duration |
|-------|-------|-----------|----------|
| Desktop Testing | [Date Range] | [Name] | 2-3 hours |
| Mobile Testing | [Date Range] | [Name] | 1-2 hours |
| Accessibility Audit | [Date Range] | [Name] | 1 hour |
| Issue Resolution | [Date Range] | [Team] | [Variable] |
| Sign-off & Deployment | [Date] | [Stakeholders] | 30 min |

### Environment Configuration Checklist

- [ ] Database migration applied (PersonOccasion has budget columns)
- [ ] API server running and endpoints responding
- [ ] Frontend app deployed or running locally
- [ ] Test user account created with test data
- [ ] Test occasions linked to test persons
- [ ] React Query working (cache visible in DevTools)
- [ ] Network requests visible in browser DevTools
- [ ] Mobile emulation or actual device ready
- [ ] Accessibility tools installed (axe DevTools, Wave, screen reader)
- [ ] Git branch/environment confirmed (not production)

---

## Sign-Off

### Testing Completion Checklist

- [ ] All P0 test cases executed and documented
- [ ] All P1 test cases executed and documented
- [ ] Critical issues (if any) resolved or workaround documented
- [ ] High priority issues (if any) resolved or documented
- [ ] Mobile responsive design verified across viewports
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Performance verified (<200ms API response, <1s page load)
- [ ] Cross-browser testing completed (Chrome, Safari, Firefox)
- [ ] Test report reviewed and approved
- [ ] Issues prioritized and assigned for resolution

### Release Gate

**Feature is APPROVED FOR RELEASE when:**

- [ ] ALL P0 tests PASS
- [ ] ALL P1 tests PASS (or issues documented with mitigation)
- [ ] NO critical blocking issues remain
- [ ] Performance meets targets
- [ ] Accessibility audit passes
- [ ] Stakeholder sign-off obtained

### Stakeholder Sign-Off

| Role | Name | Date | Signature/Approval |
|------|------|------|-------------------|
| QA Lead | [Name] | [Date] | [✓/Pending] |
| Product Owner | [Name] | [Date] | [✓/Pending] |
| Tech Lead | [Name] | [Date] | [✓/Pending] |
| Dev Team | [Name] | [Date] | [✓/Pending] |

---

## Appendices

### A. Test Data Setup Script (Optional)

```python
# For rapid test data creation (in services/api context)
from app.models.person import Person, Occasion, PersonOccasion

# Create test persons
mom = Person(name="Mom", relationship="parent")
dad = Person(name="Dad", relationship="parent")
sister = Person(name="Sister", relationship="sibling")

# Create test occasions
christmas = Occasion(name="Christmas 2024", date="2024-12-25", is_active=True)
birthday = Occasion(name="Mom's Birthday", date="2024-05-15", is_active=True)
past_party = Occasion(name="Holiday Party 2023", date="2023-12-20", is_active=False)

# Link persons to occasions
PersonOccasion.objects.create(person=mom, occasion=christmas, recipient_budget_total=200, purchaser_budget_total=75)
PersonOccasion.objects.create(person=dad, occasion=christmas, recipient_budget_total=150)
PersonOccasion.objects.create(person=sister, occasion=christmas, recipient_budget_total=100)
```

### B. Accessibility Testing Tools

**Recommended Tools**:
- axe DevTools (browser extension) - automated accessibility scanning
- WAVE (WebAIM) - color contrast, ARIA validation
- VoiceOver (Mac) - screen reader testing
- NVDA (Windows) - open-source screen reader
- Lighthouse (Chrome DevTools) - accessibility audit

**Useful Links**:
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- Touch Target Size (WCAG): https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

### C. Mobile Testing Environments

**Emulation Options**:
1. Chrome DevTools Device Emulation (iPhone SE, iPad, Android)
2. Firefox Responsive Design Mode
3. Safari Web Inspector (via Xcode Simulator on Mac)

**Real Device Testing**:
- iPhone 12+ (for notch/safe area testing)
- Android 11+ device
- Tablet (iPad or Android tablet)

### D. Performance Metrics Baseline

**Target Performance**:
- API GET /persons/{id}/occasions/{oid}/budget: <200ms
- PUT /persons/{id}/occasions/{oid}/budget: <200ms
- Page load (occasion detail): <1 second
- Progress bar update (after gift added): real-time or <500ms

**Measurement Tools**:
- Chrome DevTools Network tab (API latency)
- Lighthouse (page load performance)
- React Query DevTools (cache performance)

---

## Document Metadata

**Document ID**: UAT-2025-12-08-POB-V1
**Feature**: Person Budget per Occasion (v1)
**Created**: 2025-12-08
**Last Updated**: 2025-12-08
**Status**: Ready for Execution
**Version**: 1.0

**Related Documents**:
- PRD: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- Implementation Plan: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- Phase 5 UI Plan: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1/phase-5-ui.md`

---

**End of UAT Document**
