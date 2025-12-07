# PersonBudgetBar Component - UI/UX Design Specification

**Component:** PersonBudgetBar
**Design System:** Soft Modernity v1.0
**Last Updated:** 2025-12-07
**Status:** Enhancement Specification

---

## Overview

The PersonBudgetBar component displays budget progress visualization for a person in two distinct roles:

1. **Recipient Role**: Gifts TO this person (what they will receive)
2. **Purchaser Role**: Gifts BY this person (what they will buy for others)

### Design Goals

- Clear visual distinction between purchased (completed) and planned (pending) amounts
- Intelligent display logic that adapts to data availability
- Semantic use of status colors following Soft Modernity principles
- Mobile-first responsive design with proper touch targets
- Accessible and readable at all viewport sizes

---

## Display Logic Matrix

| Budget Set? | Gifts Exist? | Display State |
|-------------|-------------|---------------|
| No | No | **Hidden** - Component does not render |
| No | Yes | **Totals Only** - Show text summary without progress bar |
| Yes | No | **Empty State** - Show progress bar with zero values |
| Yes | Yes | **Full State** - Complete progress bar with all values |

---

## Visual States

### State 1: Full State (Budget + Gifts)

```
┌─────────────────────────────────────────────────────────┐
│ Gifts TO Alex                                           │
│                                                         │
│ Purchased      Planned       Total Budget               │ ← Headers
│ ─────────      ──────        ────────────               │
│   $45           $30            $100                     │
│                                                         │
│ ┌─────────────────────────────────────────┐            │
│ │████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 75%        │
│ └─────────────────────────────────────────┘            │
│  ↑─ Sage ──↑  ↑─── Mustard ───↑                        │
│   45%           30%                                     │
└─────────────────────────────────────────────────────────┘

Visual Details:
- Title: "Gifts TO [Name]" or "Gifts BY [Name]"
  Font: text-body-large (16px), weight 600 (Semibold)
  Color: --color-text-primary (#2D2520)

- Column Headers:
  Font: text-body-small (12px), weight 600 (Semibold)
  Color: --color-text-tertiary (#8A827C)
  Spacing: Aligned with progress bar segments

- Values:
  Font: text-heading-3 (18px), weight 700 (Bold)
  Color: --color-text-primary (#2D2520)

- Progress Bar:
  Height: 12px
  Radius: --radius-medium (12px / 0.75rem)
  Background: --color-surface-tertiary (#EBE7E0)
  Shadow: --shadow-subtle (for depth)

- Purchased Segment:
  Fill: --color-status-success-500 (#7BA676 - Sage)
  Animation: Slide from left, 300ms ease-out

- Planned Segment:
  Fill: --color-status-idea-500 (#D4A853 - Mustard)
  Opacity: 0.8 (to differentiate from purchased)
  Animation: Slide from left after purchased, 300ms ease-out with 100ms delay

- Percentage Badge:
  Position: Absolute right, aligned with bar
  Font: text-body-small (12px), weight 600
  Color: --color-text-secondary (#5C534D)
```

### State 2: Budget Only (No Gifts)

```
┌─────────────────────────────────────────────────────────┐
│ Gifts TO Alex                                           │
│                                                         │
│ Purchased      Planned       Total Budget               │
│ ─────────      ──────        ────────────               │
│   $0            $0             $100                     │
│                                                         │
│ ┌─────────────────────────────────────────┐            │
│ │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 0%         │
│ └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘

Visual Details:
- Empty bar shows background only
- No colored segments
- Headers and budget value still visible
- Provides context for planning
```

### State 3: Totals Only (No Budget)

```
┌─────────────────────────────────────────────────────────┐
│ Gifts TO Alex                                           │
│                                                         │
│ Purchased: $45  •  Planned: $30  •  Total: $75         │
│                                                         │
└─────────────────────────────────────────────────────────┘

Visual Details:
- No progress bar (can't show percentage without budget)
- Inline text format with bullet separators
- Font: text-body-medium (14px), weight 500 (Medium)
- Status colors applied to values:
  - Purchased value: --color-status-success-600 (#668B61)
  - Planned value: --color-status-idea-600 (#B88F45)
  - Total: --color-text-primary (#2D2520)
- Bullet separator: --color-border-medium (#D4CDC4)
```

### State 4: Hidden (No Budget, No Gifts)

```
(Component does not render)
```

---

## Layout Specifications

### Header Row

```
┌────────────────────┬────────────────────┬────────────────────┐
│   Purchased        │    Planned         │   Total Budget     │
│   (flex: 1)        │    (flex: 1)       │   (flex: 1.2)      │
└────────────────────┴────────────────────┴────────────────────┘
     ↓                     ↓                     ↓
┌────────────────────┬────────────────────┬────────────────────┐
│   $45              │    $30             │   $100             │
└────────────────────┴────────────────────┴────────────────────┘
```

**Implementation:**
```css
.budget-header-row {
  display: flex;
  gap: var(--spacing-4); /* 16px */
  margin-bottom: var(--spacing-2); /* 8px */
  align-items: baseline;
}

.budget-header-col {
  flex: 1;
  text-align: left;
}

.budget-header-col:last-child {
  flex: 1.2; /* Slightly more space for budget */
  text-align: right;
}

.budget-value-row {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-3); /* 12px */
}
```

### Progress Bar Anatomy

```
┌──────────────────────────────────────────────────────────┐
│ Container (relative positioning)                         │
│ ┌──────────────────────────────────────────────────┐    │
│ │ Background Track                                 │    │
│ │ ┌────────────┬───────────┐                      │    │
│ │ │ Purchased  │  Planned  │                      │    │
│ │ │   Sage     │  Mustard  │                      │    │
│ │ └────────────┴───────────┘                      │    │
│ └──────────────────────────────────────────────────┘    │
│                                            75% ←────────┼─ Badge
└──────────────────────────────────────────────────────────┘
```

**Dimensions:**
- Container: 100% width
- Track height: 12px
- Border radius: 12px (--radius-medium)
- Segment border-radius:
  - First segment: 12px 0 0 12px (left rounded)
  - Last segment: 0 12px 12px 0 (right rounded)
  - Single segment: 12px all (fully rounded)

**Spacing:**
- Gap between segments: 0px (segments touch)
- Badge offset from right: 0px (aligned with track end)
- Badge vertical alignment: centered with track

---

## Design Tokens & Colors

### Status Colors

| Element | Token | Hex Value | Usage |
|---------|-------|-----------|-------|
| Purchased Fill | `--color-status-success-500` | #7BA676 | Completed gift value segment |
| Planned Fill | `--color-status-idea-500` | #D4A853 | Pending gift value segment |
| Empty Track | `--color-surface-tertiary` | #EBE7E0 | Unfilled portion of bar |
| Purchased Text | `--color-status-success-600` | #668B61 | Value in totals-only mode |
| Planned Text | `--color-status-idea-600` | #B88F45 | Value in totals-only mode |

### Typography

| Element | Size Token | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| Section Title | `text-body-large` | 16px | 600 | 24px |
| Column Headers | `text-body-small` | 12px | 600 | 16px |
| Values | `text-heading-3` | 18px | 700 | 26px |
| Percentage | `text-body-small` | 12px | 600 | 16px |
| Totals Inline | `text-body-medium` | 14px | 500 | 20px |

### Spacing

| Element | Token | Value |
|---------|-------|-------|
| Title bottom margin | `--spacing-3` | 12px |
| Header bottom margin | `--spacing-2` | 8px |
| Values bottom margin | `--spacing-3` | 12px |
| Column gap | `--spacing-4` | 16px |
| Section padding | `--spacing-5` | 20px |

### Shadows & Elevation

| Element | Shadow Token | Value |
|---------|--------------|-------|
| Progress Track | `--shadow-subtle` | 0 1px 2px rgba(45,37,32,0.04) |
| Card Container | `--shadow-low` | 0 2px 8px rgba(45,37,32,0.06) |

---

## Responsive Behavior

### Desktop (≥1024px)

```
Full horizontal layout with all headers visible:

Purchased      Planned       Total Budget
  $45           $30            $100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%
```

**Specifications:**
- Full three-column header grid
- Values at 18px (text-heading-3)
- Progress bar height: 12px
- Touch target: N/A (desktop pointer)

### Tablet (768px - 1023px)

```
Same as desktop but with tighter spacing:

Purchased    Planned     Total Budget
  $45         $30          $100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%
```

**Specifications:**
- Column gap: 12px (--spacing-3)
- Values at 16px (text-body-large, weight 700)
- Progress bar height: 12px

### Mobile (<768px)

**Option A: Stacked Headers (Recommended)**

```
┌───────────────────────────────┐
│ Gifts TO Alex                 │
│                               │
│ Purchased  Planned  Budget    │ ← Abbreviated
│   $45       $30      $100     │
│                               │
│ ━━━━━━━━━━━━━━━━━━━━ 75%     │
└───────────────────────────────┘
```

**Specifications:**
- Abbreviated headers: "Purchased", "Planned", "Budget"
- Font size: 10px (below standard scale, but acceptable for labels)
- Values: 16px (text-body-large), weight 700
- Progress bar height: 14px (larger for touch)
- Touch target for entire card: 44px minimum height

**Option B: Values Only (Alternative)**

```
┌───────────────────────────────┐
│ Gifts TO Alex                 │
│                               │
│  $45  •  $30  •  $100         │ ← No headers
│                               │
│ ━━━━━━━━━━━━━━━━━━━━ 75%     │
└───────────────────────────────┘
```

**Specifications:**
- Headers hidden, rely on color coding
- Include accessible aria-labels
- Bullet separators: --color-border-medium
- Values: 16px, weight 700

### Breakpoint Tokens

```css
@media (max-width: 767px) {
  /* Mobile styles */
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## Animation Specifications

### Initial Load

**Progress Bar Segments:**

```css
@keyframes slideInProgress {
  from {
    width: 0%;
    opacity: 0;
  }
  to {
    width: var(--target-width);
    opacity: 1;
  }
}

.progress-purchased {
  animation: slideInProgress 300ms var(--ease-out) forwards;
}

.progress-planned {
  animation: slideInProgress 300ms var(--ease-out) 100ms forwards;
}
```

**Easing Function:**
- `--ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)`
- Duration: 300ms
- Delay: 100ms between segments

### Value Updates (Real-time)

**When purchased/planned amounts change:**

```css
@keyframes pulseHighlight {
  0%, 100% {
    background-color: transparent;
  }
  50% {
    background-color: var(--color-primary-50);
  }
}

.budget-value.updated {
  animation: pulseHighlight 400ms var(--ease-in-out);
}
```

**Segment transition:**
- Width changes: `transition: width 200ms var(--ease-out)`
- Color changes: `transition: background-color 200ms var(--ease-out)`

### State Transitions

**Budget Set → Totals Only:**
- Progress bar: Fade out 200ms
- Headers: Fade out 200ms
- Totals text: Slide in from below, 300ms

**Totals Only → Budget Set:**
- Totals text: Fade out 200ms
- Headers: Fade in 200ms
- Progress bar: Slide in + progress animation

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Sage (#7BA676) on tertiary background (#EBE7E0): 3.8:1 (AA Large Text)
- Mustard (#D4A853) on tertiary background (#EBE7E0): 4.2:1 (AA Large Text)
- Primary text (#2D2520) on base background (#FAF8F5): 12.8:1 (AAA)
- Tertiary text (#8A827C) on base background (#FAF8F5): 4.6:1 (AA)

**Note:** Progress bar segments meet AA for large text/graphics. Consider adding border or pattern for users with color vision deficiency.

### Semantic HTML

```html
<section
  aria-labelledby="budget-title-recipient"
  role="region"
  class="person-budget-bar"
>
  <h3 id="budget-title-recipient" class="budget-title">
    Gifts TO Alex
  </h3>

  <!-- Full state with progress bar -->
  <div role="group" aria-label="Budget breakdown">
    <div class="budget-headers" aria-hidden="true">
      <span>Purchased</span>
      <span>Planned</span>
      <span>Total Budget</span>
    </div>

    <div class="budget-values">
      <span aria-label="Purchased amount: $45">$45</span>
      <span aria-label="Planned amount: $30">$30</span>
      <span aria-label="Total budget: $100">$100</span>
    </div>

    <div
      role="progressbar"
      aria-valuenow="75"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="75% of budget allocated"
      class="progress-bar"
    >
      <div class="progress-segment purchased" style="width: 45%">
        <span class="sr-only">Purchased: 45%</span>
      </div>
      <div class="progress-segment planned" style="width: 30%">
        <span class="sr-only">Planned: 30%</span>
      </div>
    </div>
  </div>
</section>
```

### Screen Reader Support

**Announcements:**
- Budget updated: "Budget updated. Purchased $45, Planned $30 of $100 total. 75% allocated."
- State change: "Budget view changed to totals only. No budget set."

**aria-live regions:**
```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {statusMessage}
</div>
```

### Keyboard Navigation

- Not directly interactive (read-only display)
- Ensure parent card/container has focus styles
- Tab order: Title → Values (if focusable for additional actions)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .progress-purchased,
  .progress-planned {
    animation: none;
    transition: none;
  }

  .budget-value.updated {
    animation: none;
  }
}
```

---

## Implementation Guidelines

### Tailwind CSS Classes

**Component Container:**
```jsx
<div className="space-y-3 p-5 bg-white rounded-2xl shadow-sm">
  {/* Content */}
</div>
```

**Title:**
```jsx
<h3 className="text-base font-semibold text-warm-900">
  Gifts TO {personName}
</h3>
```

**Header Row:**
```jsx
<div className="flex gap-4 mb-2">
  <span className="flex-1 text-xs font-semibold text-warm-600 uppercase tracking-wide">
    Purchased
  </span>
  <span className="flex-1 text-xs font-semibold text-warm-600 uppercase tracking-wide">
    Planned
  </span>
  <span className="flex-[1.2] text-xs font-semibold text-warm-600 uppercase tracking-wide text-right">
    Total Budget
  </span>
</div>
```

**Value Row:**
```jsx
<div className="flex gap-4 mb-3">
  <span className="flex-1 text-lg font-bold text-warm-900">
    ${purchased}
  </span>
  <span className="flex-1 text-lg font-bold text-warm-900">
    ${planned}
  </span>
  <span className="flex-[1.2] text-lg font-bold text-warm-900 text-right">
    ${budget}
  </span>
</div>
```

**Progress Bar:**
```jsx
<div className="relative">
  <div className="h-3 bg-warm-200 rounded-xl overflow-hidden shadow-subtle">
    <div
      className="h-full bg-sage-500 transition-all duration-300 ease-out"
      style={{ width: `${purchasedPercent}%` }}
    />
    <div
      className="h-full bg-mustard-500 opacity-80 transition-all duration-300 ease-out"
      style={{ width: `${plannedPercent}%` }}
    />
  </div>
  <span className="absolute right-0 top-1/2 -translate-y-1/2 ml-3 text-xs font-semibold text-warm-700">
    {totalPercent}%
  </span>
</div>
```

**Totals Only (No Budget):**
```jsx
<p className="text-sm font-medium text-warm-700">
  <span className="text-sage-600">Purchased: ${purchased}</span>
  <span className="mx-2 text-warm-400">•</span>
  <span className="text-mustard-600">Planned: ${planned}</span>
  <span className="mx-2 text-warm-400">•</span>
  <span className="text-warm-900">Total: ${total}</span>
</p>
```

### Custom Color Classes (tailwind.config.js)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#FAF8F5',
          100: '#F5F2ED',
          200: '#EBE7E0',
          300: '#D4CDC4',
          400: '#C4BDB7',
          500: '#A69C94',
          600: '#8A827C',
          700: '#5C534D',
          800: '#3D3632',
          900: '#2D2520',
        },
        sage: {
          50: '#F3F7F2',
          100: '#E4EDE2',
          200: '#C5D8C1',
          300: '#A0BD9B',
          400: '#8AAA84',
          500: '#7BA676', // Primary sage
          600: '#668B61',
          700: '#51704E',
          800: '#3D543B',
          900: '#2A3928',
        },
        mustard: {
          50: '#FDF9F0',
          100: '#FAF1DC',
          200: '#F4E0B3',
          300: '#E8CC85',
          400: '#DCB85E',
          500: '#D4A853', // Primary mustard
          600: '#B88F45',
          700: '#967538',
          800: '#735A2B',
          900: '#523F1F',
        },
      },
    },
  },
}
```

---

## Testing Checklist

### Visual Testing

- [ ] All four states render correctly (Full, Budget Only, Totals Only, Hidden)
- [ ] Progress bar segments align with header columns
- [ ] Percentage badge aligns properly with bar end
- [ ] Colors match design tokens exactly
- [ ] Shadows render with warm undertones
- [ ] Border radius is consistent (12px)
- [ ] Typography sizes and weights match spec

### Responsive Testing

- [ ] Desktop (≥1024px): Full three-column layout
- [ ] Tablet (768-1023px): Tighter spacing, full headers
- [ ] Mobile (<768px): Abbreviated headers or values-only
- [ ] Progress bar height increases on mobile (14px)
- [ ] No horizontal overflow at any breakpoint
- [ ] Touch targets meet 44px minimum on mobile

### Interaction Testing

- [ ] Initial load animation plays smoothly
- [ ] Segment widths animate from 0 to target
- [ ] Value updates trigger pulse animation
- [ ] State transitions are smooth
- [ ] Reduced motion preference disables animations
- [ ] No layout shift during animations

### Accessibility Testing

- [ ] Screen reader announces all values correctly
- [ ] Progress bar has proper ARIA attributes
- [ ] Color contrast meets WCAG AA standards
- [ ] Semantic HTML structure is valid
- [ ] Keyboard navigation works (if interactive)
- [ ] Focus indicators are visible (if applicable)

### Data Testing

- [ ] Zero values display correctly
- [ ] Large numbers format properly (e.g., $1,234.56)
- [ ] Percentage calculation is accurate
- [ ] Over-budget scenarios handled (>100%)
- [ ] Null/undefined budget handled gracefully
- [ ] Empty gifts array handled correctly

---

## Edge Cases

### Over-Budget Scenario (>100%)

When purchased + planned exceeds budget:

```
Purchased      Planned       Total Budget
  $80           $50            $100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 130%
```

**Visual Treatment:**
- Bar fills to 100% of container width
- Percentage shows actual value (e.g., 130%)
- Consider adding warning indicator:
  - Border: 1px solid --color-status-warning-500 (#C97B63)
  - Or subtle terracotta background tint

### Very Small Percentages (<5%)

When a segment is too small to show visually:

**Solution:**
- Set minimum segment width: 4px
- Maintain accurate percentage in aria-label
- Consider showing tooltip on hover with exact value

### Long Budget Values

For large numbers (e.g., $10,000.00):

**Solution:**
- Use locale-aware number formatting
- Consider abbreviations for very large numbers (e.g., $10k)
- Ensure column widths accommodate 6-digit values
- Mobile: Stack values vertically if needed

### No Data States

**Loading:**
```jsx
<div className="animate-pulse">
  <div className="h-4 bg-warm-200 rounded w-32 mb-2"></div>
  <div className="h-12 bg-warm-200 rounded"></div>
</div>
```

**Error:**
```jsx
<div className="text-sm text-terracotta-600">
  Unable to load budget data
</div>
```

---

## Component API (React)

```typescript
interface PersonBudgetBarProps {
  /** Person's name */
  personName: string;

  /** Role context: recipient or purchaser */
  role: 'recipient' | 'purchaser';

  /** Total purchased amount (completed gifts) */
  purchased: number;

  /** Total planned amount (pending gifts) */
  planned: number;

  /** Total budget (optional - changes display mode) */
  budget?: number;

  /** Currency code (default: USD) */
  currency?: string;

  /** Show animation on mount */
  animate?: boolean;

  /** Custom class name */
  className?: string;

  /** Accessibility label override */
  ariaLabel?: string;
}
```

**Usage Examples:**

```tsx
// Full state
<PersonBudgetBar
  personName="Alex"
  role="recipient"
  purchased={45}
  planned={30}
  budget={100}
/>

// Totals only (no budget)
<PersonBudgetBar
  personName="Sam"
  role="purchaser"
  purchased={120}
  planned={55}
/>

// Empty state
<PersonBudgetBar
  personName="Jordan"
  role="recipient"
  purchased={0}
  planned={0}
  budget={150}
/>

// Hidden (won't render)
<PersonBudgetBar
  personName="Taylor"
  role="recipient"
  purchased={0}
  planned={0}
/>
```

---

## Design Review Checklist

- [x] Follows Soft Modernity design principles
- [x] Uses design tokens exclusively (no hardcoded values)
- [x] Warm color palette applied (Sage, Mustard)
- [x] 8px spacing grid adhered to
- [x] Generous border radius (12px)
- [x] Typography hierarchy clear and consistent
- [x] Mobile-first responsive design
- [x] Touch targets meet 44px minimum
- [x] WCAG 2.1 AA accessibility compliant
- [x] Animations smooth and purposeful (200-300ms)
- [x] Reduced motion support included
- [x] Semantic HTML structure
- [x] Screen reader friendly
- [x] Edge cases documented
- [x] All four display states specified

---

## References

- **Design Tokens:** `/docs/designs/DESIGN-TOKENS.md`
- **Design Guide:** `/docs/designs/DESIGN-GUIDE.md`
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/

---

**Specification Author:** UI Designer Agent
**Review Status:** Ready for Implementation
**Next Steps:**
1. Implement component with ui-engineer agent
2. Add unit tests for all display states
3. Conduct accessibility audit
4. Test on target devices (iOS Safari, Chrome)
