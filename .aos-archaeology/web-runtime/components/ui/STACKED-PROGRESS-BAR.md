# StackedProgressBar Component

A stacked/layered progress bar component for displaying budget or capacity progress with multiple segments, following the Family Gifting Dashboard "Soft Modernity" design system.

## Overview

The StackedProgressBar displays a horizontal progress bar with three distinct segments:
- **Purchased segment** (emerald/green): Shows completed/purchased amount
- **Planned segment** (amber/mustard): Shows remaining planned amount
- **Track** (warm grey): Shows remaining capacity

```
|████████████████░░░░░░░░░░░░░░░░░░░░|
 └─purchased─┘└─planned─┘└──remaining──┘
```

## Features

- **Soft Modernity Design**: Warm colors, generous rounded corners, smooth transitions
- **Interactive Tooltips**: Hover to show detailed item breakdown with images
- **Accessible**: Full ARIA support, keyboard navigation
- **Mobile-First**: 44px touch targets when interactive, responsive design
- **Currency Formatting**: Automatic USD formatting with Intl.NumberFormat
- **Size Variants**: sm (6px), md (8px), lg (12px) height options
- **Flexible**: Works with or without tooltips, labels, amounts

## Installation

This component is part of the Family Gifting Dashboard UI library. No additional installation required.

### Dependencies
- `@radix-ui/react-tooltip` - For accessible tooltips
- `@/components/ui/tooltip` - Tooltip wrapper components
- `@/components/ui/badge` - Badge component for status indicators
- `@/lib/utils` - cn() utility for className merging

## Basic Usage

```tsx
import { StackedProgressBar } from '@/components/ui/stacked-progress-bar';

function MyComponent() {
  return (
    <StackedProgressBar
      total={500}
      planned={300}
      purchased={150}
      label="Gifts to Give"
      showAmounts
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `total` | `number` | Total budget/capacity (full bar width) |
| `planned` | `number` | Planned/attached amount (amber segment) |
| `purchased` | `number` | Purchased amount (emerald segment) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `undefined` | Label text displayed above the bar |
| `showAmounts` | `boolean` | `false` | Show currency amounts in header |
| `variant` | `'recipient' \| 'purchaser'` | `'recipient'` | Color scheme variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Bar height (6px/8px/12px) |
| `className` | `string` | `undefined` | Additional CSS classes |
| `tooltipItems` | `TooltipItem[]` | `[]` | Items to show in tooltip |
| `onItemClick` | `(id: number \| string) => void` | `undefined` | Callback when tooltip item clicked |
| `maxTooltipItems` | `number` | `5` | Max items to show before overflow |

### TooltipItem Type

```typescript
interface TooltipItem {
  id: number | string;           // Unique identifier
  name: string;                  // Item name
  price: number;                 // Item price
  status: 'purchased' | 'planned'; // Status badge
  imageUrl?: string;             // Optional image URL
}
```

## Examples

### Basic Progress Bar

```tsx
<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
/>
```

### With Label and Amounts

```tsx
<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
  label="Gifts to Give"
  showAmounts
/>
```

### With Interactive Tooltip

```tsx
const gifts = [
  {
    id: 1,
    name: 'LEGO Set',
    price: 75.99,
    status: 'purchased',
    imageUrl: '/images/lego.jpg'
  },
  {
    id: 2,
    name: 'Board Game',
    price: 24.99,
    status: 'planned'
  }
];

<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
  label="Gifts to Give"
  showAmounts
  tooltipItems={gifts}
  onItemClick={(id) => router.push(`/gifts/${id}`)}
/>
```

### Different Sizes

```tsx
{/* Small - 6px height */}
<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
  size="sm"
/>

{/* Medium (default) - 8px height */}
<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
  size="md"
/>

{/* Large - 12px height */}
<StackedProgressBar
  total={200}
  planned={100}
  purchased={75}
  size="lg"
/>
```

### In PersonCard Context

```tsx
function PersonCard({ person }) {
  const { data: budget } = usePersonBudget(person.id);

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3>{person.name}</h3>

      {budget && (
        <StackedProgressBar
          total={budget.budget_cap}
          planned={budget.gifts_assigned_total}
          purchased={budget.gifts_purchased_total}
          label="Gifts to Give"
          showAmounts
          variant="recipient"
          tooltipItems={budget.gifts.map(g => ({
            id: g.id,
            name: g.name,
            price: g.price,
            status: g.purchase_date ? 'purchased' : 'planned',
            imageUrl: g.image_url
          }))}
          onItemClick={(id) => openGiftModal(id)}
        />
      )}
    </div>
  );
}
```

## Accessibility

The component implements full accessibility features:

### ARIA Attributes
- `role="progressbar"` on the bar element
- `aria-valuenow` for current progress percentage
- `aria-valuemin="0"` and `aria-valuemax="100"`
- `aria-label` with descriptive progress information

### Keyboard Navigation
- Tooltip items are keyboard accessible
- Tab navigation works as expected
- Interactive elements meet 44px touch target requirements

### Screen Readers
- Descriptive labels for all segments
- Currency amounts announced properly
- Status badges provide context

## Visual Design

### Colors (Soft Modernity)

**Recipient Variant:**
- Purchased: `emerald-500` (#10b981) - Sage/Green
- Planned: `amber-400` (#fbbf24) - Mustard/Amber
- Track: `warm-200` (#E8E3DC) - Warm Grey

**Purchaser Variant:**
- Same colors (variants can be customized if needed)

### Border Radius
- `rounded-full` - Complete pill shape for progress bar
- `rounded-sm` - Subtle rounding for tooltip images
- `rounded-md` - Soft corners for tooltip items

### Transitions
- `transition-all duration-300 ease-out` - Smooth segment animations
- Hover states on tooltip items

### Typography
- Header label: `text-xs font-medium text-gray-500`
- Amounts: `text-sm font-semibold text-gray-900`
- Tooltip items: `text-sm font-medium` for names, `text-xs` for prices

## Edge Cases

The component handles various edge cases gracefully:

1. **Zero values**: Renders empty bar with proper structure
2. **Purchased > Planned**: Remaining planned becomes 0 (not negative)
3. **Planned > Total**: Segments can exceed 100% (shows over-budget)
4. **No tooltip items**: Renders static bar without tooltip wrapper
5. **Missing images**: Shows fallback initial circle

## Performance

- Uses CSS transforms for smooth animations
- Tooltip lazy-loads on hover (Radix UI)
- Memoization opportunities for large item lists
- No unnecessary re-renders

## Testing

Comprehensive test coverage included:

```bash
# Run component tests
npm test stacked-progress-bar.test.tsx
```

Test coverage includes:
- Basic rendering with all prop combinations
- Size variants
- Edge cases (zero, overflow, etc.)
- Accessibility attributes
- Tooltip functionality
- Currency formatting
- Custom className application

## Related Components

- **PersonBudgetBar**: Uses two separate progress bars for gifts to give and purchased
- **BudgetMeter**: Three-segment meter with different segment logic
- **MiniCardTooltip**: Generic tooltip wrapper (pattern used here)

## Design System Compliance

This component follows the Family Gifting Dashboard design system:

- **Design Tokens**: `docs/designs/DESIGN-TOKENS.md`
- **Component Specs**: `docs/designs/COMPONENTS.md`
- **Layout Patterns**: `docs/designs/LAYOUT-PATTERNS.md`

## Migration from PersonBudgetBar

If replacing PersonBudgetBar with StackedProgressBar:

```tsx
// Before (PersonBudgetBar)
<PersonBudgetBar personId={1} variant="card" />

// After (StackedProgressBar with React Query)
const { data: budget } = usePersonBudget(personId);
const { data: gifts } = useGifts({ person_id: personId });

<StackedProgressBar
  total={budget.budget_cap}
  planned={budget.gifts_assigned_total}
  purchased={budget.gifts_purchased_total}
  label="Gifts to Give"
  showAmounts
  tooltipItems={gifts?.map(g => ({
    id: g.id,
    name: g.name,
    price: g.price,
    status: g.purchase_date ? 'purchased' : 'planned',
    imageUrl: g.image_url
  }))}
  onItemClick={(id) => router.push(`/gifts/${id}`)}
/>
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 12+)
- Mobile: Touch-optimized with 44px targets

## Known Limitations

1. Color variants (recipient/purchaser) currently use same colors - ready for customization
2. Tooltip requires JavaScript - no fallback for no-JS scenarios
3. Currency format hardcoded to USD (can be made configurable)

## Future Enhancements

Potential improvements:

- [ ] Configurable currency/locale
- [ ] Different color schemes for variants
- [ ] Animation on mount option
- [ ] Vertical orientation
- [ ] Custom segment renderers
- [ ] Gradient fills option
- [ ] Click handlers on segments themselves

## Support

For questions or issues:
1. Check the example file: `stacked-progress-bar.example.tsx`
2. Review test cases: `__tests__/stacked-progress-bar.test.tsx`
3. Consult design docs: `docs/designs/COMPONENTS.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-07
**Component Type**: UI Component (Presentation)
**Design System**: Soft Modernity
