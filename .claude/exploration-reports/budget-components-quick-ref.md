---
title: Budget Components - Quick Reference
description: Fast lookup guide for budget component implementation patterns
---

# Budget Components - Quick Reference

## Component Structure Template

```typescript
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 1. CVA Variants
const componentVariants = cva(
  'base-transition',
  {
    variants: {
      variant: { default: 'default-styles' },
      size: { md: 'medium-size' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

// 2. Props Interface
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof componentVariants> {}

// 3. Component with forwardRef
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Component.displayName = 'Component';

export { Component };
```

## React Query Hook Template

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetApi } from '@/lib/api/endpoints';

// Query
export function useBudget(occasionId: string) {
  return useQuery({
    queryKey: ['budgets', occasionId],
    queryFn: () => budgetApi.get(occasionId),
    staleTime: 1000 * 60 * 5,              // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!occasionId,
  });
}

// Mutation
export function useUpdateBudget(occasionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetUpdate) => budgetApi.update(occasionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', occasionId] });
    },
  });
}
```

## Real-Time Sync Integration

```typescript
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

function Component({ occasionId }: { occasionId: string }) {
  // Fetch data
  const budget = useBudget(occasionId);

  // Subscribe to updates
  useRealtimeSync({
    topic: `budget:${occasionId}`,
    queryKey: ['budgets', occasionId],
    events: ['UPDATED'],
  });

  return <div>/* JSX */</div>;
}
```

## Tailwind Color Tokens

| Use Case | Token | Tailwind Class |
|---|---|---|
| Purchased segment | status-success-500 | `bg-status-success-500` |
| Planned segment | status-progress-500 | `bg-status-progress-500` |
| Remaining segment | border-subtle | `bg-warm-200` |
| Over budget warning | status-warning-500 | `bg-status-warning-500` |
| Text on success | status-success-700 | `text-status-success-700` |
| Card background | surface-primary | `bg-surface-primary` |
| Hover elevation | shadow-medium | `hover:shadow-medium` |

## Responsive Breakpoints

```typescript
// Mobile-first approach
className="
  w-full                    // Mobile
  md:w-2/3                  // 768px+
  lg:max-w-2xl              // 1024px+
  px-4                      // Mobile padding
  md:px-6
  text-body-small           // Mobile text
  md:text-body-medium
"
```

## Touch Target (Mobile Accessibility)

```typescript
// All interactive elements ≥ 44x44px
className="min-h-[44px] min-w-[44px]"
```

## ARIA Labels & Accessibility

```tsx
<div
  role="progressbar"
  aria-label="Budget meter: $280 purchased, $120 planned, $100 remaining"
  aria-valuenow={spent}
  aria-valuemin={0}
  aria-valuemax={total}
/>

<div role="alert" aria-live="polite">
  Warning: Would exceed budget
</div>
```

## Transitions & Animations

```typescript
// Smooth transitions
className="transition-all duration-300 ease-out"

// Specific property
className="transition-transform duration-200"

// Hover state
className="hover:shadow-medium hover:scale-[1.01] transition-all duration-200"

// Active state
className="active:scale-95 active:shadow-subtle"
```

## Common Tailwind Classes

| Purpose | Classes |
|---|---|
| Flex container | `flex items-center justify-between gap-4` |
| Rounded corners | `rounded-small` (8px), `rounded-large` (16px) |
| Shadows | `shadow-low`, `shadow-medium`, `shadow-high` |
| Text color | `text-warm-900`, `text-status-success-700` |
| Background | `bg-surface-primary`, `bg-status-idea-100` |
| Border | `border border-border-subtle`, `border-2 border-status-warning-500` |
| Opacity | `opacity-50`, `disabled:opacity-50` |

## Component Props Pattern

```typescript
interface BudgetMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  // Data
  occasionName: string;
  totalBudget: number;
  purchasedAmount: number;
  plannedAmount: number;

  // Behavior
  showTooltips?: boolean;
  onNavigate?: () => void;

  // Style variants
  variant?: 'default' | 'compact' | 'mini';
  className?: string;
}
```

## Loading State Pattern

```typescript
const budget = useBudget(id);

if (budget.isPending) {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-warm-200 rounded-large" />
    </div>
  );
}

if (budget.error) {
  return <ErrorDisplay error={budget.error} />;
}

return <BudgetDisplay data={budget.data} />;
```

## Error Handling Pattern

```typescript
// Component level
if (budget.error) {
  return (
    <div
      role="alert"
      className="bg-status-warning-50 border border-status-warning-500 rounded-large p-4"
    >
      <p className="text-status-warning-800 font-semibold">Error loading budget</p>
      <p className="text-status-warning-700 text-sm">{budget.error.message}</p>
    </div>
  );
}
```

## File Organization

```
components/budget/
├── BudgetMeter.tsx           # Main meter component
├── BudgetTooltip.tsx         # Tooltip overlay
├── BudgetWarningCard.tsx     # Warning alert
├── BudgetContextSidebar.tsx  # Form sidebar
├── ColumnPriceTotal.tsx      # Kanban header badge
└── ListBudgetHeader.tsx      # List header meter

hooks/
├── useBudget.ts              # Fetch budget data
├── useBudgetBreakdown.ts     # Get breakdown with gifts
└── useUpdateBudget.ts        # Mutation to update

lib/api/endpoints/
└── budgetApi.ts              # API calls
```

## Status Mapping Reference

```typescript
const statusColors = {
  purchased: 'status-success-500',    // Sage green
  planned: 'status-progress-500',     // Lavender
  remaining: 'border-subtle',         // Gray
  overBudget: 'status-warning-500',   // Terracotta
};

const textColors = {
  purchased: 'text-status-success-700',
  planned: 'text-status-progress-700',
  remaining: 'text-warm-600',
  overBudget: 'text-status-warning-700',
};
```

## Mobile Safe Areas

```tsx
// Account for iPhone notch/status bar
<div className="pt-safe-area-inset-top pb-safe-area-inset-bottom">
  {/* Content */}
</div>

// In CSS: env(safe-area-inset-top/right/bottom/left)
```

## Responsive Grid Pattern

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items automatically stack on mobile */}
</div>
```

## Conditional Rendering

```tsx
// Status-based
{isOverBudget && <BudgetWarningCard />}

// Loading-based
{budget.isPending ? <LoadingSkeleton /> : <BudgetDisplay />}

// Data-based
{budget.data?.items.length > 0 ? (
  <ItemsList items={budget.data.items} />
) : (
  <EmptyState message="No budget set" />
)}
```

## Key Performance Tips

1. **Use React Query's staleTime** - 5 minutes for budget data
2. **Memoize components** - If receiving complex props
3. **Debounce WebSocket events** - For high-frequency updates
4. **Use code splitting** - Lazy load complex modals
5. **Optimize animations** - Use transform/opacity, not layout properties

## Testing Checklist

- [ ] Component renders with required props
- [ ] Loading state displays spinner/skeleton
- [ ] Error state shows error message
- [ ] Data displays correctly when loaded
- [ ] Responsive: mobile/tablet/desktop layouts work
- [ ] Touch targets are ≥ 44x44px
- [ ] ARIA labels present
- [ ] Hover states work
- [ ] Keyboard navigation works
- [ ] WebSocket updates trigger re-renders

---

**For detailed specs, see:** docs/designs/budget-progression-meter-ui-spec.md
**For full patterns guide, see:** .claude/exploration-reports/frontend-budget-patterns-exploration.md
