---
title: Budget Progression Meter UI Specification
description: Design specifications for budget visualization and tracking components
audience: Designers, Frontend Developers
tags: [design, components, budget, ui, visualization, specifications]
created: 2025-12-04
updated: 2025-12-04
---

# Budget Progression Meter UI Specification

Design specifications for the Budget Progression Meter feature, implementing budget tracking and visualization components within the Family Gifting Dashboard "Soft Modernity" design system.

**Related Documentation:**
- For color values and token names, see [DESIGN-TOKENS.md](./DESIGN-TOKENS.md)
- For design philosophy and usage patterns, see [DESIGN-GUIDE.md](./DESIGN-GUIDE.md)
- For component patterns, see [COMPONENTS.md](./COMPONENTS.md)

---

## Overview

The Budget Progression Meter provides visual feedback on budget utilization across three states:
- **Purchased** (completed spending)
- **Planned** (committed but not yet purchased)
- **Remaining** (available budget)

### Design Goals

1. **At-a-glance clarity**: Instant understanding of budget status
2. **Progressive disclosure**: Summary view with detailed tooltips
3. **Contextual awareness**: Budget info appears where decisions are made
4. **Non-blocking**: Warnings inform but don't prevent actions
5. **Real-time feedback**: Updates immediately as gifts are added/moved

---

## Color System

### Budget State Colors

| State | Color Token | Hex Value | Usage |
|-------|-------------|-----------|-------|
| **Purchased** | `status-success-500` | `#7BA676` | Completed spending (Sage green) |
| **Planned** | `status-progress-500` | `#8A78A3` | Committed spending (Lavender) |
| **Remaining** | `border-subtle` | `#E8E3DC` | Available budget (Subtle gray) |
| **Over Budget** | `status-warning-500` | `#C97B63` | Warning indicator (Terracotta) |

### Text Colors for $ Amounts

Match segment colors for visual association:
- Purchased amount: `status-success-700` (`#51704E`)
- Planned amount: `status-progress-700` (`#594E6E`)
- Remaining amount: `warm-600` (`#8A827C`)
- Over budget: `status-warning-700` (`#8D4E40`)

---

## Component 1: BudgetMeter

The primary horizontal progression bar component showing three budget segments.

### Visual Specifications

**Bar Structure:**
- Total height: `12px`
- Border radius: `8px` (`radius-small`, pill-shaped)
- Display: flex row, no gaps
- Overflow: hidden (maintains rounded corners)
- Container padding: `spacing-6` (24px)
- Container background: `surface-primary` (white)
- Container border-radius: `radius-xlarge` (20px)
- Container shadow: `shadow-low`

**Segments:**
- Each segment: height `12px`, no border radius (parent handles)
- Purchased segment: background `status-success-500`
- Planned segment: background `status-progress-500`
- Remaining segment: background `border-subtle`
- Width: Calculated as percentage of total budget
- Transition: `width 200ms ease-out` (animated changes)

**Layout Pattern:**
```
┌──────────────────────────────────────────────────┐
│  Occasion: Christmas 2025                        │
│  Budget: $500                                    │
│  ┌────────────────────────────────────────────┐  │
│  ├████████████┼████████┼─────────────────────┤  │
│  │ Purchased  │ Planned│    Remaining         │  │
│  └────────────────────────────────────────────┘  │
│  $280 / $120 / $100                              │
└──────────────────────────────────────────────────┘
```

### Text Display

**Amount Labels:**
- Position: Below bar, centered horizontally
- Layout: Flex row, justify-space-between, gap `spacing-4` (16px)
- Font: `body-medium` (14px), weight semibold (600)
- Format: `$XXX / $YYY / $ZZZ`
- Colors: Match segment colors (see Color System above)
- Mobile: Stack vertically if needed below 480px

**Occasion Header:**
- Position: Above bar
- Font: `heading-2` (20px), weight bold (700)
- Color: `text-primary` (`#2D2520`)
- Margin-bottom: `spacing-3` (12px)

**Budget Total:**
- Position: Right side of occasion header or below
- Font: `body-medium` (14px), weight regular (400)
- Color: `text-secondary` (`#5C534D`)
- Format: "Budget: $XXX"

### States

#### Default (Within Budget)

- Standard colors as specified
- No warning indicators
- Shadow: `shadow-low`
- Border: `1px solid border-subtle`

#### Over Budget

- Add warning indicator icon (⚠️) next to budget total
- Warning text: `body-small` in `status-warning-700`
- Message: "+$XX over budget"
- Remaining segment: changes to `status-warning-200` (lighter terracotta)
- Container border: changes to `status-warning-500` (2px solid)
- Shadow: `shadow-medium` (elevated attention)

#### No Budget Set

- Component hidden completely
- Alternative: Show as disabled state with gray placeholder
- Message: "No budget set for this occasion"

#### Loading (Skeleton)

- Bar: Pulsing gray rectangle (`pulse` animation)
- Text: Multiple pulsing gray lines
- Duration: While fetching budget data
- Background: `warm-200`
- Animation: `pulse` (2s infinite)

#### Empty (No Gifts)

- Full-width remaining segment (gray)
- Text: "$0 / $0 / $XXX"
- Purchased and Planned at 0%
- Message: "No gifts added yet"

### Interactivity

**Hover States:**

Segment hover:
- Scale: `1.01` (subtle lift)
- Cursor: pointer
- Shadow: Segment glows with `shadow-medium`
- Transition: `200ms ease-out`
- Tooltip appears (see BudgetTooltip component)

Amount hover:
- Color: Brightens by one shade (e.g., `-600` → `-500`)
- Cursor: pointer
- Same tooltip appears as segment hover
- Underline: Dotted 1px in matching color

**Click Action:**
- Navigate to occasion gifts page/modal
- Filter by segment status (purchased/planned/all)
- Smooth transition: `300ms ease-in-out`

### Responsive Behavior

**Mobile (< 640px):**
- Container: Full width, `padding-x-4` (16px)
- Bar height: Same (12px maintains touch context)
- Amounts: Stack vertically below bar, each on own line
- Font size: Same (14px, no reduction)
- Touch targets: Entire segment is tappable (44px height container)

**Tablet (640px - 1023px):**
- Container: Full width with max-width `640px`
- Inline amounts beside bar if space allows
- Standard hover interactions

**Desktop (≥ 1024px):**
- Container: Max-width `800px`
- Amounts displayed inline to the right
- Full hover/tooltip interactions

### Accessibility

- **Semantic HTML**: `<div role="progressbar" aria-valuenow aria-valuemin aria-valuemax>`
- **Screen reader**: Announces "Budget progression: $280 purchased, $120 planned, $100 remaining of $500 total"
- **Color independence**: Include text labels, not just colors
- **Focus indicator**: 2px ring in `primary-500` with 2px offset
- **Keyboard navigation**: Tab to meter, Enter to navigate to details
- **ARIA labels**: `aria-label="Budget meter for Christmas 2025"`

---

## Component 2: BudgetTooltip

Overlay panel showing list of gifts when hovering over meter segments.

### Visual Specifications

**Container:**
- Position: Absolute, positioned relative to hovered segment
- Width: `300px` (fixed)
- Max-height: `400px`
- Background: `rgba(255, 255, 255, 0.92)` (translucent white)
- Backdrop filter: `blur(12px)` (glass effect)
- Border: `1px solid border-subtle`
- Border radius: `radius-large` (16px)
- Shadow: `shadow-high`
- Padding: `spacing-5` (20px)
- Z-index: `1000` (above all content)

**Positioning:**
- Desktop: Below segment, centered horizontally
- Arrow pointer: 8px triangle pointing to segment
- Offset: 8px from segment
- If near viewport edge: Adjust horizontal position
- Mobile: Appears as bottom sheet (see Mobile Behavior)

**Header:**
- Font: `heading-3` (18px), weight semibold (600)
- Color: Matches segment color (e.g., `status-success-700` for Purchased)
- Margin-bottom: `spacing-3` (12px)
- Content: "Purchased Gifts (3)" or "Planned Gifts (2)" or "Remaining Budget"

**Gift List:**
- Max visible items: 5-6
- Overflow: Scroll with custom scrollbar styling
- Gap: `spacing-2` (8px) between items
- Each item: See Gift Item specification below

**Gift Item:**
```
┌────────────────────────────────────────┐
│ [Avatar] LEGO Star Wars Set         ✕ │
│          $49.99 · For Johnny           │
└────────────────────────────────────────┘
```

- Layout: Flex row, items-center, gap `spacing-3`
- Avatar: 32px (`avatar-sm`), rounded-full
- Gift name: `body-medium` (14px), weight medium (500), color `text-primary`
- Price: `body-small` (12px), weight semibold (600), color segment color
- Recipient: `body-small` (12px), weight regular (400), color `text-tertiary`
- Separator: " · " between price and recipient
- Hover: Background `warm-100`, cursor pointer
- Click: Opens gift detail modal

**Footer (if > 6 gifts):**
- Text: "+X more gifts"
- Font: `body-small` (12px), color `text-secondary`
- Alignment: Center
- Margin-top: `spacing-2` (8px)
- Click: Shows full list modal

### Remaining Budget Tooltip

Special case when hovering over remaining segment:

**Header:** "Remaining Budget"

**Content:**
- Large number: `heading-1` (24px), color `text-primary`, weight bold
- Format: "$XXX remaining"
- Subtext: "Available for X more gifts"
- Calculation hint: Based on average gift price if data available

**Suggestion (optional):**
- Text: "Average gift: $XX"
- Color: `text-tertiary`
- Font: `body-small`

### Animation

**Enter:**
```css
from: opacity 0, translateY(-8px)
to: opacity 1, translateY(0)
duration: 150ms
easing: ease-out
```

**Exit:**
```css
from: opacity 1, translateY(0)
to: opacity 0, translateY(-8px)
duration: 100ms
easing: ease-in
```

**Delay:** 200ms before showing (prevents accidental triggers)

### Mobile Behavior (< 768px)

**Replace tooltip with bottom sheet:**
- Position: Fixed bottom
- Width: 100vw
- Height: Auto, max `60vh`
- Border radius: `radius-2xlarge` top corners only (24px)
- Slide up animation: `translateY(100%) → translateY(0)`, 300ms
- Backdrop: `overlay-medium` with backdrop blur
- Close button: Top-right "✕" icon, 44px touch target
- Swipe down: Gesture to close

---

## Component 3: BudgetWarningCard

Alert card shown when adding a gift would exceed budget.

### Visual Specifications

**Container:**
- Width: Full width of parent (typically inside modal/form)
- Background: `status-warning-50` (very light terracotta)
- Border: `2px solid status-warning-500`
- Border radius: `radius-large` (16px)
- Padding: `spacing-4` (16px)
- Margin-bottom: `spacing-4` (16px)
- Shadow: `shadow-subtle`
- Display: Flex row, items-start, gap `spacing-3`

**Icon:**
- Symbol: ⚠️ (warning triangle) or alert circle
- Size: 24px
- Color: `status-warning-600`
- Position: Top-left, flex-shrink-0

**Content:**
- Layout: Flex column, gap `spacing-2`
- Title: `body-large` (16px), weight semibold (600), color `status-warning-800`
- Message: `body-medium` (14px), weight regular (400), color `status-warning-700`
- Numbers: Weight bold (700) for emphasis

**Message Format:**
- Template: "This gift ($XX) would exceed your $YYY budget by $ZZ"
- Example: "This gift ($75) would exceed your $500 budget by $25"
- Alternative: "Adding this gift will put you $XX over budget"

**Tone:**
- Informational, not blocking
- Non-alarming language
- Helpful, not scolding
- Acknowledge user's autonomy

**Action Buttons (optional):**
- Layout: Flex row, gap `spacing-2`, margin-top `spacing-3`
- "Adjust Budget" button: Secondary variant, small size
- "Continue Anyway" button: Tertiary variant, small size

### States

**Default:**
- As specified above
- Appears when gift price would cause overage

**Dismissed:**
- Fade out: 200ms, ease-out
- Maintains form state
- Does not prevent submission

**With Suggestions:**
- Additional section: "Consider these alternatives:"
- Shows 2-3 similar gifts under budget
- Each item: Small card with image, name, price

### Animation

**Appear:**
```css
from: opacity 0, translateY(-16px), scale(0.98)
to: opacity 1, translateY(0), scale(1)
duration: 250ms
easing: ease-out (with spring)
```

**Shake (if user ignores and submits):**
```css
keyframes: translateX(-4px, 4px, -4px, 0)
duration: 300ms
easing: ease-in-out
```

### Accessibility

- **Role**: `role="alert"` (announces to screen readers)
- **ARIA live**: `aria-live="polite"`
- **Focus management**: Does not steal focus
- **Dismissible**: Escape key or close button
- **Screen reader**: "Warning: This gift would exceed budget by X dollars"

---

## Component 4: BudgetContextSidebar

Compact budget display shown within gift forms and modals.

### Visual Specifications

**Container:**
- Position: Sticky sidebar (desktop) or inline section (mobile)
- Width: `280px` (desktop sidebar) or full-width (mobile inline)
- Background: `surface-secondary` (`#F5F2ED`)
- Border: `1px solid border-subtle`
- Border radius: `radius-large` (16px)
- Padding: `spacing-5` (20px)
- Shadow: `shadow-subtle`

**Desktop Layout:**
```
┌─────────────────────────┐
│ Add Gift Form           │  ┌──────────────────┐
│ ┌─────────────────────┐ │  │ Budget Context   │
│ │ Gift Name           │ │  │                  │
│ │ [____________]      │ │  │ Christmas 2025   │
│ │                     │ │  │ Total: $500      │
│ │ Price               │ │  │                  │
│ │ [$________]         │ │  │ ████████░░░░     │
│ │                     │ │  │ Spent: $280      │
│ │ Recipient           │ │  │ Remaining: $220  │
│ │ [____________]      │ │  │                  │
│ └─────────────────────┘ │  │ After this: $170 │
│                         │  └──────────────────┘
│ [Cancel]  [Add Gift]    │
└─────────────────────────┘
```

**Header:**
- Occasion name: `heading-3` (18px), weight semibold, color `text-primary`
- Budget total: `body-small` (12px), weight regular, color `text-secondary`
- Format: "Total: $XXX"
- Margin-bottom: `spacing-4` (16px)

**Mini Meter:**
- Height: `8px` (smaller than main meter)
- Border radius: `6px`
- Same three-segment structure
- No hover interactions
- Margin-bottom: `spacing-3` (12px)

**Stats Display:**
- Layout: Flex column, gap `spacing-2` (8px)
- Each line: Label + Value
- Label: `body-small`, color `text-tertiary`, weight regular
- Value: `body-small`, color segment color, weight semibold
- Format: "Spent: $XXX" / "Remaining: $XXX"

**Live Update Section:**
- Border-top: `1px solid border-medium`
- Padding-top: `spacing-3` (12px)
- Margin-top: `spacing-4` (16px)
- Label: "After this gift:" `body-small`, color `text-secondary`
- New remaining: `body-medium`, weight bold, dynamic color
  - Green (`status-success-700`) if within budget
  - Red (`status-warning-700`) if over budget
- Updates in real-time as user types price

### Recipient Sub-Budget (Advanced)

If recipient has a personal sub-budget, show nested section:

**Sub-Budget Display:**
- Indented slightly (left margin `spacing-3`)
- Background: `warm-100` (lighter than container)
- Border-left: `3px solid status-idea-400`
- Padding: `spacing-3` (12px)
- Border-radius: `radius-small` (8px)
- Mini meter: 6px height
- Text: Smaller (`body-small`)
- Format: "Johnny's budget: $150"

### States

**Default:**
- Displays current budget status
- Updates on any data change

**Loading:**
- Skeleton placeholders
- Pulsing gray rectangles
- Maintains layout structure

**No Budget Set:**
- Message: "No budget set"
- Suggestion: "Add budget to track spending"
- Link/button: "Set Budget" (secondary, small)

**Error:**
- Message: "Unable to load budget"
- Retry button: Tertiary, small
- Icon: ⚠️ in `status-warning-500`

### Mobile Behavior (< 768px)

**Converted to inline card:**
- Position: Above form fields
- Full width: 100%
- Collapsible: Tap header to expand/collapse
- Starts collapsed after first view
- Collapse icon: Chevron up/down
- Animation: Height transition, 200ms ease-out

### Accessibility

- **Heading**: "Budget information" (not visible, screen reader only)
- **Live region**: `aria-live="polite"` for real-time updates
- **Labels**: Associated with meter segments
- **Keyboard**: Focusable if interactive (set budget button)

---

## Component 5: ColumnPriceTotal

Badge displaying total price at top of Kanban columns.

### Visual Specifications

**Container:**
- Display: Inline-flex, items-center
- Position: Right side of column header
- Background: Gradient matching column status color
  - Purchased: `from-status-success-100 to-status-success-50`
  - Planned: `from-status-progress-100 to-status-progress-50`
  - Ideas: `from-status-idea-100 to-status-idea-50`
- Padding: `6px 12px` (spacing-1.5 and spacing-3)
- Border: `1px solid` (status color `-300` shade)
- Border radius: `radius-small` (8px, pill-shaped)
- Font: `body-small` (12px), weight semibold (600)
- Color: Status color `-800` shade
- Shadow: None (subtle elevation from column)

**Layout in Column Header:**
```
┌──────────────────────────────────┐
│ Ideas (5)                   $245 │
├──────────────────────────────────┤
│ [Gift cards...]                  │
```

- Position: Flex justify-between
- Column title: Left aligned
- Price badge: Right aligned
- Gap: `spacing-4` (16px)
- Vertical alignment: Centered

**Format:**
- Text: "$XXX" (no decimals if even, show decimals if needed)
- No label (just the price)
- Updates in real-time via WebSocket

### Color Mapping

| Column Status | Background Gradient | Border | Text | Example |
|--------------|---------------------|--------|------|---------|
| **Idea** | `status-idea-100 → 50` | `status-idea-300` | `status-idea-800` | Mustard theme |
| **Shortlisted** | `status-idea-100 → 50` | `status-idea-300` | `status-idea-800` | Mustard theme |
| **Buying** | `status-progress-100 → 50` | `status-progress-300` | `status-progress-800` | Lavender theme |
| **Ordered** | `status-progress-100 → 50` | `status-progress-300` | `status-progress-800` | Lavender theme |
| **Purchased** | `status-success-100 → 50` | `status-success-300` | `status-success-800` | Sage theme |
| **Delivered** | `status-success-100 → 50` | `status-success-300` | `status-success-800` | Sage theme |
| **Gifted** | `status-success-100 → 50` | `status-success-300` | `status-success-800` | Sage theme |

### States

**Default:**
- As specified above
- Static (non-interactive)

**Zero Total:**
- Display: "$0" in lighter color (`text-tertiary`)
- Alternative: Hide badge completely if column empty

**Loading:**
- Placeholder: `···` (ellipsis) or spinner
- Same styling as default
- Pulsing animation optional

**Update Animation:**
- On value change: Brief scale pulse
  ```css
  keyframes: scale(1) → scale(1.08) → scale(1)
  duration: 300ms
  easing: ease-out
  ```
- Flash background: Brightness increase for 200ms

### Responsive Behavior

**Mobile (< 640px):**
- Same size and styling
- May wrap to second line if column title is long
- Minimum touch target not required (display only)

**Desktop (≥ 1024px):**
- Inline with column header
- Hover: Tooltip showing breakdown (optional)

### Accessibility

- **Role**: Display only (not interactive)
- **ARIA label**: "Total price: $XXX"
- **Screen reader**: "Column Ideas contains 5 gifts totaling $245"
- **Color independence**: Text included, not just visual badge

---

## Component 6: ListBudgetHeader

Compact budget meter at top of list views linked to occasions.

### Visual Specifications

**Container:**
- Position: Sticky top (below main header)
- Width: Full viewport width
- Height: `60px`
- Background: `surface-primary` with `backdrop-blur-md`
- Border-bottom: `2px solid border-subtle`
- Shadow: `shadow-low`
- Padding: `spacing-4` horizontal (16px)
- Z-index: `400` (below modals, above content)

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Christmas 2025 List           $380 / $500 (76%) │
│  ████████████████████░░░░░░░░                    │
└──────────────────────────────────────────────────┘
```

**Header Text:**
- Layout: Flex row, justify-between, items-center
- List name: `heading-3` (18px), weight semibold, color `text-primary`
- Budget display: `body-medium` (14px), weight regular, color `text-secondary`
- Format: "$XXX / $YYY (ZZ%)"
- Gap: `spacing-2` (8px)

**Progress Bar:**
- Height: `6px` (very compact)
- Width: 100% of container
- Border radius: `radius-small` (8px)
- Margin-top: `spacing-2` (8px)
- Two segments only: Spent (combined purchased + planned) and Remaining
- Spent color: `primary-500` (coral)
- Remaining color: `border-subtle` (gray)
- Over budget: Extends past 100%, remaining becomes `status-warning-200`

**Percentage Indicator:**
- Display: Inline with budget display
- Format: "(XX%)"
- Color:
  - Green `status-success-700` if < 75%
  - Orange `status-idea-700` if 75-100%
  - Red `status-warning-700` if > 100%
- Weight: Semibold (600)

### States

**Default (Within Budget):**
- As specified above
- Border: `border-subtle`

**Approaching Limit (> 75%):**
- Border: `status-idea-500` (mustard)
- Percentage: Orange color
- Icon: ⚠️ before percentage (optional)

**Over Budget:**
- Border: `status-warning-500` (terracotta)
- Background: `status-warning-50` (very light terracotta tint)
- Percentage: Red, bold
- Icon: 🔴 or ⚠️ before percentage
- Message: "+$XX over" after percentage

**No Budget:**
- Hide component completely
- Alternative: Show grayed out with message

**Loading:**
- Skeleton bar pulsing
- Text placeholders pulsing
- Maintains height and layout

### Interactivity

**Click/Tap:**
- Action: Opens budget detail modal or expands inline
- Hover: Background lightens to `warm-50`
- Cursor: Pointer
- Transition: 200ms ease-out

**Scroll Behavior:**
- Sticky: Remains at top while scrolling list
- Slight shadow increase on scroll (depth indication)
- iOS safe-area: Top padding accounts for notch

### Mobile Behavior (< 640px)

**Compact Version:**
- Height: `56px` (reduced)
- Text: Slightly smaller (`body-small`)
- Progress bar: 5px height (reduced)
- May wrap to two lines if needed
- Safe area: `pt-safe-area-inset-top`

**Layout Adjustment:**
```
┌────────────────────────────┐
│  Christmas List       76%  │
│  $380 / $500               │
│  ████████████░░░░          │
└────────────────────────────┘
```

### Accessibility

- **Role**: Banner or complementary
- **ARIA label**: "Budget progress for Christmas 2025 List"
- **Screen reader**: "List budget: $380 spent of $500, 76% used"
- **Keyboard**: Focusable, Enter to expand/navigate
- **Focus indicator**: 2px ring around entire header

---

## Layout Integration

### Dashboard Integration

**Position:** Above "Idea Inbox" section

**Container:**
```
┌──────────────────────────────────────┐
│ Dashboard                            │
├──────────────────────────────────────┤
│ [Stat Cards Row]                     │
│                                      │
│ [Family Members Carousel]            │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Budget Meter (Upcoming Occasion) │ │
│ │ Christmas 2025 - $380 / $500     │ │
│ │ ████████████████░░░░              │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Idea Inbox Section]                 │
└──────────────────────────────────────┘
```

**Specs:**
- Card variant: Elevated
- Padding: `spacing-6` (24px)
- Margin-bottom: `spacing-6` (24px)
- Shows only upcoming/current occasion budget
- Click: Navigates to occasion detail page

### Occasion Modal/Page Integration

**Position:** Top of occasion details, below header

**Container:**
```
┌──────────────────────────────────────┐
│ ← Back    Christmas 2025             │
├──────────────────────────────────────┤
│ [Budget Meter - Full Width]          │
│ $380 / $120 / $0                     │
│ ████████████████████░░░░              │
│                                      │
│ Recipients (optional):               │
│ ├─ Johnny: $150 / $200 ████████░░   │
│ ├─ Sarah: $230 / $300  ████████░░   │
│                                      │
├──────────────────────────────────────┤
│ [Gifts Section]                      │
└──────────────────────────────────────┘
```

**Sub-Budget Breakdown:**
- Indented: `spacing-4` left margin
- Smaller meter: 8px height
- Collapsible: Click to expand/collapse
- Shows per-recipient budget if applicable

### Kanban Integration

**Position:** Column headers

**Container:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Ideas      $245 │ Buying     $180 │ Purchased  $380 │
│ (5 gifts)       │ (3 gifts)       │ (7 gifts)       │
├─────────────────┼─────────────────┼─────────────────┤
│ [Gift Card]     │ [Gift Card]     │ [Gift Card]     │
│ [Gift Card]     │ [Gift Card]     │ [Gift Card]     │
│ [Gift Card]     │ [Gift Card]     │ [Gift Card]     │
└─────────────────┴─────────────────┴─────────────────┘
```

**Real-Time Updates:**
- Updates via WebSocket on status change
- Totals recalculate immediately
- Smooth animations on value changes
- Flash effect on update: 200ms

---

## Responsive Breakpoints

### Mobile First (< 640px)

**BudgetMeter:**
- Full width, padding reduced to `spacing-4` (16px)
- Amounts stack vertically below bar
- Touch targets: 44px minimum for interactions

**BudgetTooltip:**
- Replaced with bottom sheet modal
- Full-width drawer from bottom
- Swipe down to dismiss

**BudgetContextSidebar:**
- Inline card above form
- Collapsible section
- Full width

**ColumnPriceTotal:**
- Same styling, may wrap text

**ListBudgetHeader:**
- Reduced height (56px)
- Two-line layout if needed
- Smaller progress bar (5px)

### Tablet (640px - 1023px)

**BudgetMeter:**
- Max-width: 640px, centered
- Amounts inline if space permits
- Standard interactions

**BudgetTooltip:**
- Standard tooltip (not bottom sheet)
- May adjust position to avoid overflow

**BudgetContextSidebar:**
- Inline card (not sidebar yet)
- Full width within form

### Desktop (≥ 1024px)

**BudgetMeter:**
- Max-width: 800px
- Amounts inline to the right
- Full hover/tooltip interactions

**BudgetContextSidebar:**
- Becomes true sidebar (280px fixed)
- Sticky positioning within scroll context

**BudgetTooltip:**
- Standard positioning
- Arrow pointer to segment

---

## Animation Specifications

### Meter Segment Transitions

```css
/* Width changes (when budget updates) */
.segment {
  transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Color changes (when states change) */
.segment {
  transition: background-color 200ms ease-out;
}
```

### Hover Interactions

```css
/* Segment hover lift */
.segment:hover {
  transform: scale(1.01);
  box-shadow: var(--shadow-medium);
  transition: all 200ms ease-out;
}

/* Amount hover brighten */
.amount:hover {
  color: /* one shade lighter */;
  text-decoration: underline dotted 1px;
  transition: color 150ms ease-out;
}
```

### Tooltip Animations

```css
/* Fade in with slide */
@keyframes tooltipEnter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip {
  animation: tooltipEnter 150ms ease-out;
}
```

### Warning Card Animations

```css
/* Slide in with spring */
@keyframes warningEnter {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.warning-card {
  animation: warningEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Shake on ignored warning */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.warning-card.shake {
  animation: shake 300ms ease-in-out;
}
```

### Value Update Pulse

```css
/* When numbers change */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.value-update {
  animation: pulse 300ms ease-out;
}
```

### Loading Skeleton

```css
/* Pulsing placeholder */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background: var(--color-warm-200);
}
```

---

## Accessibility Checklist

### Visual Accessibility

- [x] Color contrast ≥ 4.5:1 for all text
- [x] Status colors not sole indicator (text labels included)
- [x] Focus indicators: 2px ring, primary color, 2px offset
- [x] Touch targets ≥ 44px on all interactive elements
- [x] Reduced motion support: Respect `prefers-reduced-motion`

### Screen Reader Support

- [x] Semantic HTML: `<progress>`, `<meter>`, or proper ARIA roles
- [x] ARIA labels: Descriptive labels on all meters and badges
- [x] ARIA live regions: Budget updates announced (`aria-live="polite"`)
- [x] ARIA expanded: Collapsible sections indicate state
- [x] Alt text: Icons have descriptive text alternatives

### Keyboard Navigation

- [x] Tab order: Logical, follows visual layout
- [x] Enter/Space: Activates interactive elements
- [x] Escape: Closes tooltips and modals
- [x] Arrow keys: Navigate between segments (optional enhancement)
- [x] Focus trap: Modals trap focus until closed

### Mobile Accessibility

- [x] iOS VoiceOver: All elements announced correctly
- [x] Android TalkBack: All elements announced correctly
- [x] Zoom support: Text scales up to 200% without breaking layout
- [x] Touch gestures: Swipe to navigate, double-tap to activate
- [x] Safe areas: Content not obscured by notches or system UI

### Error Prevention

- [x] Warning cards: Alerts before budget exceeded
- [x] Confirmation: Optional for over-budget submissions
- [x] Undo: Support for accidental actions (via optimistic updates)
- [x] Clear messaging: Errors explained in plain language

---

## Implementation Notes

### Data Structure

**Budget Calculation:**
```typescript
interface BudgetStatus {
  total: number;
  purchased: number;  // Sum of gifts in "Purchased" status
  planned: number;    // Sum of gifts in "Shortlisted", "Buying", "Ordered"
  remaining: number;  // total - (purchased + planned)
  percentage: number; // ((purchased + planned) / total) * 100
  isOverBudget: boolean;
  overageAmount: number;
}
```

**Real-Time Updates:**
- WebSocket event: `BUDGET_UPDATED`
- Payload includes new totals
- React Query cache invalidation
- Optimistic UI updates

### CSS Variables

Add to `globals.css`:

```css
:root {
  /* Budget-specific colors */
  --color-budget-purchased: var(--color-status-success-500);
  --color-budget-planned: var(--color-status-progress-500);
  --color-budget-remaining: var(--color-border-subtle);
  --color-budget-over: var(--color-status-warning-500);

  /* Budget meter sizing */
  --budget-meter-height: 12px;
  --budget-meter-mini-height: 8px;
  --budget-meter-compact-height: 6px;
}
```

### Tailwind Extensions

Add to `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      'budget-purchased': 'var(--color-budget-purchased)',
      'budget-planned': 'var(--color-budget-planned)',
      'budget-remaining': 'var(--color-budget-remaining)',
      'budget-over': 'var(--color-budget-over)',
    },
    height: {
      'budget-meter': '12px',
      'budget-meter-mini': '8px',
      'budget-meter-compact': '6px',
    },
  }
}
```

### Component Props (TypeScript)

```typescript
interface BudgetMeterProps {
  occasionId: string;
  occasionName: string;
  totalBudget: number;
  purchasedAmount: number;
  plannedAmount: number;
  showTooltips?: boolean;
  onNavigate?: () => void;
  variant?: 'default' | 'compact' | 'mini';
  className?: string;
}

interface BudgetTooltipProps {
  gifts: Gift[];
  type: 'purchased' | 'planned' | 'remaining';
  totalAmount: number;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

interface BudgetWarningCardProps {
  giftPrice: number;
  totalBudget: number;
  currentSpent: number;
  onDismiss?: () => void;
  showActions?: boolean;
}
```

---

## Visual Examples (ASCII Mockups)

### Full BudgetMeter Component

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Christmas 2025                     Budget: $500 ┃
┃                                                  ┃
┃  ┌─────────────────────────────────────────────┐┃
┃  ├█████████████████████████┼█████████┼────────┤┃
┃  │     Purchased           │ Planned │Remaining│┃
┃  └─────────────────────────────────────────────┘┃
┃                                                  ┃
┃  $280 (Sage)  /  $120 (Lavender)  /  $100 (Gray)┃
┃                                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### BudgetMeter - Over Budget State

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Christmas 2025        Budget: $500  ⚠️ +$25 over┃
┃                                                  ┃
┃  ┌─────────────────────────────────────────────┐┃
┃  ├█████████████████████████████████████████████┤┃
┃  │           Purchased + Planned         (Over)│┃
┃  └─────────────────────────────────────────────┘┃
┃                                                  ┃
┃  $350 (Sage)  /  $175 (Lavender)  /  -$25 (Red) ┃
┃                                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### BudgetTooltip - Purchased Gifts

```
        ┌──────────────────────────────────┐
        │ Purchased Gifts (3)              │
        ├──────────────────────────────────┤
        │ 👤 LEGO Star Wars Set         ✕ │
        │    $49.99 · For Johnny           │
        │                                  │
        │ 👤 Apple Watch                ✕ │
        │    $199.99 · For Sarah           │
        │                                  │
        │ 👤 Kindle Paperwhite          ✕ │
        │    $129.99 · For Mom             │
        └──────────────────────────────────┘
           ▲
           └─ Points to Purchased segment
```

### BudgetWarningCard

```
┌────────────────────────────────────────────────────┐
│ ⚠️  Budget Warning                                  │
│                                                    │
│ This gift ($75) would exceed your $500 budget     │
│ by $25. You can still add it if needed.           │
│                                                    │
│ [Adjust Budget]  [Continue Anyway]                │
└────────────────────────────────────────────────────┘
```

### BudgetContextSidebar - Desktop

```
┌────────────────────┐
│ Budget Context     │
│                    │
│ Christmas 2025     │
│ Total: $500        │
│                    │
│ ██████████░░░░░    │
│                    │
│ Spent: $380        │
│ Remaining: $120    │
│ ─────────────────  │
│ After this gift:   │
│ $70 remaining ✓    │
│                    │
│ Johnny's budget:   │
│ ████████░░  $150   │
└────────────────────┘
```

### ColumnPriceTotal in Kanban Header

```
┌─────────────────────────────────────┐
│ Ideas (5)                      $245 │
│                          [Mustard]  │
├─────────────────────────────────────┤
│  ┌────────────────────────────────┐ │
│  │ LEGO Star Wars Set             │ │
│  │ $49.99                         │ │
│  └────────────────────────────────┘ │
```

### ListBudgetHeader - Sticky Top

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Christmas 2025 List        $380 / $500 (76%) ┃
┃ ████████████████████████░░░░░░░░               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
│ [Content scrolls below]                       │
│ [Gift items...]                               │
```

---

## Design Rationale

### Why Three Segments?

- **Purchased**: Completed spending (past tense)
- **Planned**: Committed spending (present/future)
- **Remaining**: Available budget (future potential)

Three segments provide clarity without overwhelming users. More granular breakdowns are available via tooltips.

### Why These Colors?

- **Sage Green** (Purchased): Aligns with success/completion
- **Lavender** (Planned): Progress state, active but not complete
- **Subtle Gray** (Remaining): Neutral, available space
- **Terracotta** (Over Budget): Warm warning, not alarming

Colors maintain the "Soft Modernity" aesthetic while conveying meaning.

### Why Non-Blocking Warnings?

Gift-giving involves emotional decisions. Hard blocks create friction and frustration. Informational warnings respect user autonomy while providing helpful context.

### Why Sticky List Header?

Budget context is most valuable when making decisions. Keeping budget visible while scrolling gifts helps users make informed choices without navigating away.

### Why Real-Time Updates?

In a collaborative family environment, seeing budget changes immediately prevents duplicate purchases and maintains shared awareness. Optimistic updates provide instant feedback.

---

## Future Enhancements

### Phase 2 Features (Not in V1)

- **Historical tracking**: Budget usage over time graphs
- **Smart suggestions**: AI-powered gift alternatives within budget
- **Currency conversion**: Multi-currency family support
- **Budget templates**: Preset budgets for common occasions
- **Spending patterns**: Analytics on typical spending per recipient
- **Budget negotiations**: Shared family budget voting/discussion

### Nice-to-Have Additions

- **Confetti animation**: When completing within budget
- **Milestone celebrations**: Badges for budget goals achieved
- **Export reports**: PDF budget summary for tax/records
- **Photo receipts**: Attach purchase receipts to gifts
- **Price alerts**: Notify when watched gifts go on sale

---

## Related Documentation

- **[DESIGN-TOKENS.md](./DESIGN-TOKENS.md)** — Color values, spacing, typography
- **[DESIGN-GUIDE.md](./DESIGN-GUIDE.md)** — Design philosophy and principles
- **[COMPONENTS.md](./COMPONENTS.md)** — Core component specifications
- **[LAYOUT-PATTERNS.md](./LAYOUT-PATTERNS.md)** — Layout and responsive patterns

---

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-04
**Author:** Family Gifting Dashboard Design Team
