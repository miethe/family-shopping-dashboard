# Budget Components

Budget-related UI components for displaying budget tracking and warnings.

## Components

### BudgetWarningCard

Warning display component for budget overspend alerts.

**Features:**
- CVA variants for severity levels
- Accessible alert role with ARIA labels
- Optional dismiss functionality
- Mobile-friendly touch targets (44x44px)
- Responsive design

**Usage:**

```tsx
import { BudgetWarningCard } from '@/components/budget';

// Basic usage
<BudgetWarningCard
  warning={{
    level: 'approaching',
    message: 'You are approaching your budget limit',
    threshold_percent: 75,
    current_percent: 80
  }}
/>

// With dismiss button
<BudgetWarningCard
  warning={{
    level: 'exceeded',
    message: 'Budget exceeded! Consider adjusting your purchases.',
    threshold_percent: 100,
    current_percent: 105
  }}
  onDismiss={() => console.log('Warning dismissed')}
/>
```

**Severity Levels:**

| Level | Threshold | Color | Icon |
|-------|-----------|-------|------|
| none | 0-74% | hidden | - |
| approaching | 75-89% | amber/yellow | ⚠️ |
| near_limit | 90-99% | orange | ⛔ |
| exceeded | 100%+ | red | 🚨 |

**Props:**

```typescript
interface BudgetWarning {
  level: 'none' | 'approaching' | 'near_limit' | 'exceeded';
  message: string;
  threshold_percent: number;
  current_percent: number;
}

interface BudgetWarningCardProps {
  warning: BudgetWarning;
  onDismiss?: () => void;
  className?: string;
}
```

**Accessibility:**
- `role="alert"` - Announces changes to screen readers
- `aria-live="polite"` - Non-intrusive announcements
- `aria-label` - Descriptive labels per severity
- Touch-friendly dismiss button (44x44px minimum)

---

### BudgetMeter

Three-segment horizontal progress bar showing budget progression with purchased, planned, and remaining amounts.

**Features:**
- CVA variants for size (sm, md, lg)
- Three distinct segments: purchased (green), planned (blue), remaining (gray)
- Over-budget indicator with red border and shadow
- Optional segment click handlers for interactivity
- Accessible with ARIA progressbar role
- Keyboard navigation support (Enter/Space)
- Mobile-friendly with 44px minimum touch targets
- Currency formatting with Intl.NumberFormat
- Responsive text sizing
- No budget state placeholder

**Usage:**

```tsx
import { BudgetMeter, BudgetMeterSkeleton } from '@/components/budget';

// Basic usage
<BudgetMeter data={budgetData} />

// With segment click handlers
<BudgetMeter
  data={budgetData}
  onSegmentClick={(segment) => {
    // Handle 'purchased', 'planned', or 'remaining' click
    console.log(`Clicked: ${segment}`);
  }}
  size="lg"
  showLabels={true}
/>

// Loading state
<BudgetMeterSkeleton size="md" showLabels={true} />
```

**Data Structure:**

```typescript
interface BudgetMeterData {
  budget_total: number | null;
  purchased_amount: number;
  planned_amount: number;
  remaining_amount: number | null;
  purchased_percent: number;
  planned_percent: number;
  is_over_budget: boolean;
  has_budget: boolean;
}
```

**Size Variants:**

| Size | Bar Height | Text Size |
|------|-----------|-----------|
| sm | 2px (0.5rem) | text-xs |
| md | 4px (1rem) | text-sm |
| lg | 6px (1.5rem) | text-base |

**Visual States:**

1. **Normal**: Gray border, standard segments
2. **Over Budget**: Red border with glow shadow, "Over budget!" label
3. **No Budget**: Dashed border placeholder with "No budget set" message

**Accessibility:**
- `role="progressbar"` - Semantic progress indicator
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` - Current/min/max values
- `aria-label` - Descriptive label with percentage and status
- Keyboard navigation - Tab to segments, Enter/Space to activate
- Segment labels with ARIA for screen readers

**Currency Formatting:**
Uses `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` for consistent USD formatting.

---

### BudgetMeterSkeleton

Loading skeleton state for BudgetMeter component with animated pulse effect.

**Usage:**

```tsx
import { BudgetMeterSkeleton } from '@/components/budget';

<BudgetMeterSkeleton size="md" showLabels={true} />
```

**Features:**
- Matches BudgetMeter structure
- Animated pulse effect
- Size variants (sm, md, lg)
- Optional labels skeleton
- ARIA busy and loading states

### BudgetTooltip

Interactive tooltip that displays gift details when hovering/clicking budget segments.

**Features:**
- Responsive design (bottom sheet on mobile, popover on desktop)
- Glass morphism background with backdrop blur
- Scrollable gift list (max height: 300px)
- Keyboard accessible (ESC to close, focus trap)
- Click outside to close
- Smooth animations

**Usage:**

```tsx
import { BudgetTooltip } from '@/components/budget';

function BudgetDisplay() {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const gifts = [
    { id: 1, name: 'LEGO Set', price: 89.99, recipient: 'John' },
    { id: 2, name: 'Headphones', price: 129.99, recipient: 'Sarah' },
  ];

  const total = gifts.reduce((sum, gift) => sum + (gift.price || 0), 0);

  return (
    <>
      <div
        ref={anchorRef}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
      >
        Budget Segment
      </div>

      <BudgetTooltip
        segment="purchased"
        gifts={gifts}
        totalAmount={total}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorEl={anchorRef.current}
      />
    </>
  );
}
```

**Props:**

```typescript
interface Gift {
  id: number;
  name: string;
  price: number | null;
  recipient?: string;
}

interface BudgetTooltipProps {
  segment: 'purchased' | 'planned';  // Display type
  gifts: Gift[];                     // Array of gift objects
  totalAmount: number;               // Total amount for the segment
  isOpen: boolean;                   // Controls visibility
  onClose: () => void;               // Close handler
  anchorEl?: HTMLElement | null;     // Element to position near (desktop)
  className?: string;                // Additional CSS classes
}
```

**Responsive Behavior:**

| Breakpoint | Behavior |
|------------|----------|
| Mobile (< 768px) | Bottom sheet (fixed to bottom, full width) |
| Desktop (≥ 768px) | Floating popover (positioned near anchor element) |

**Accessibility:**
- `role="dialog"` - Proper semantic structure
- `aria-modal="true"` - Modal dialog behavior
- `aria-label="Budget details"` - Descriptive label
- Focus trap - Keyboard navigation contained within tooltip
- ESC key - Closes the tooltip
- Close button - Clearly labeled with `aria-label`

**Empty State:**
When no gifts are available, displays: "No gifts in this category"

**Example Integration:**
See `BudgetTooltip.example.tsx` for complete implementation examples including:
- Basic usage
- Integration with BudgetMeter component
- Handling state management
