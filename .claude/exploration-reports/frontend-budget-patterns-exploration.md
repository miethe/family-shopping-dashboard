---
title: Frontend Budget Components - Pattern Exploration Report
description: Comprehensive analysis of frontend patterns for creating budget visualization components
audience: Frontend developers implementing budget features
created: 2025-12-04
status: Complete
---

# Frontend Budget Components - Pattern Exploration Report

## Executive Summary

This report documents the frontend patterns, conventions, and existing implementations discovered in the Family Gifting Dashboard codebase. It provides a comprehensive guide for implementing budget visualization components (BudgetMeter, BudgetTooltip, BudgetWarningCard) following project conventions.

**Key Findings:**
- Established component patterns using CVA (class-variance-authority) for variants
- React Query for data fetching with 5-minute cache staleTime
- Real-time sync via WebSocket integration with useRealtimeSync hook
- Tailwind CSS with custom design tokens (warm, status colors)
- Mobile-first responsive design with 44px touch targets
- Comprehensive accessibility patterns with ARIA labels

---

## 1. File Structure & Organization

### Web App Directory Structure

```
apps/web/
├── app/                           # Next.js App Router pages
│   ├── dashboard/
│   ├── lists/
│   ├── gifts/
│   └── page.tsx
├── components/                    # React components
│   ├── ui/                       # Base UI primitives
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── status-pill.tsx
│   │   ├── icon.tsx
│   │   ├── tooltip.tsx
│   │   └── ...
│   ├── domain/                   # Domain-specific components
│   │   ├── gifts/
│   │   ├── lists/
│   │   └── occasions/
│   └── shared/                   # Shared across features
│       ├── Header.tsx
│       └── Navigation.tsx
├── hooks/                         # React hooks
│   ├── useGifts.ts
│   ├── useOccasion.ts
│   ├── useGift.ts
│   ├── useRealtimeSync.ts
│   ├── useLists.ts
│   ├── useListItems.ts
│   └── useAuth.ts
├── lib/                          # Utilities
│   ├── api/
│   ├── websocket/
│   ├── utils.ts
│   └── cn.ts
├── types/                         # TypeScript types
│   └── index.ts
└── tailwind.config.ts
```

### Naming Conventions

**Components:**
- PascalCase file names: `BudgetMeter.tsx`
- Co-located styles via Tailwind classes
- Variants defined via CVA
- Export component as default or named export

**Hooks:**
- camelCase with `use` prefix: `useBudget.ts`
- Custom hooks handle data fetching and state management
- Hooks return object with `{ data, isLoading, error }`

**Utils:**
- camelCase: `formatPrice.ts`, `calculateBudget.ts`
- Shared across components

---

## 2. React Query Hook Patterns

### Standard Query Hook Pattern

```typescript
// Example: useGifts.ts
export function useGifts(params?: GiftListParams, options?: UseGiftsOptions) {
  const { enabled = true } = options || {};

  const query = useQuery({
    queryKey: ['gifts', params],              // Queryable cache key
    queryFn: () => giftApi.list(params),      // API call function
    staleTime: 1000 * 60 * 5,                 // 5 minutes cache
    refetchOnWindowFocus: true,               // Refetch on window focus
    enabled,                                  // Conditional enabling
  });

  return query;
}
```

### Key Configurations

- **staleTime:** 5 minutes (1000 * 60 * 5) - Good balance between updates and performance
- **refetchOnWindowFocus:** true - Ensures fresh data when user returns to tab
- **queryKey structure:** ['resource', identifier, params] - Hierarchical for cache management
- **enabled option:** Conditional query execution

### Mutation Hook Pattern

```typescript
export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GiftCreate) => giftApi.create(data),
    onSuccess: () => {
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
    },
  });
}
```

### Real-Time Sync Integration

```typescript
// hooks/useRealtimeSync.ts
export function useRealtimeSync(options: UseRealtimeSyncOptions): void {
  const {
    topic,                    // WebSocket topic: "resource:id"
    queryKey,                 // React Query key to invalidate
    events = DEFAULT_EVENTS,  // Event types to listen for
    onEvent,                  // Custom event handler (optional)
    debounceMs = 0,          // Debounce for high-frequency events
    enabled = true,
  } = options;

  // Implementation uses WebSocket context + React Query
  // See useRealtimeSync.ts for full implementation
}
```

### Usage Patterns for Budget Features

**For fetching budget data:**
```typescript
// budgetApi pattern
const budget = useQuery({
  queryKey: ['budgets', occasionId],
  queryFn: () => budgetApi.get(occasionId),
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: true,
});
```

**For real-time budget updates (WebSocket):**
```typescript
// In budget context/dashboard
useRealtimeSync({
  topic: `budget:${occasionId}`,
  queryKey: ['budgets', occasionId],
  events: ['UPDATED'],
});
```

---

## 3. Component Patterns

### Base Component Structure (CVA-based)

```typescript
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 1. Define CVA styles with variants
const componentVariants = cva(
  'base-styles transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'default-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'small-size-classes',
        md: 'medium-size-classes',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// 2. Define component props
export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof componentVariants> {}

// 3. Create component with forwardRef
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

### Real Component Example: StatusPill

```typescript
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// 1. Status config maps backend values to design tokens
const statusConfig: Record<GiftStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
  idea: {
    bg: 'bg-status-idea-100',
    text: 'text-status-idea-900',
    border: 'border-status-idea-300',
    dot: 'bg-status-idea-600',
    label: 'Idea',
  },
  // ... more statuses
};

// 2. Component props
interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: GiftStatus;
  withDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  ariaLabel?: string;
}

// 3. Component implementation
export function StatusPill({
  status,
  withDot = true,
  size = 'md',
  animated = false,
  ariaLabel,
  className,
  ...props
}: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-small border',
        'transition-all duration-300 ease-out',
        animated && 'animate-scale-in',
        sizeClasses[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
      role="status"
      aria-label={ariaLabel || `Status: ${config.label}`}
      {...props}
    >
      {withDot && (
        <span
          className={cn('rounded-full', dotSizeClasses[size], config.dot)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}
```

### Key Component Patterns

1. **'use client' directive** - Required for interactive components
2. **forwardRef** - Allows parent access to DOM elements
3. **CVA for variants** - Type-safe styling variants
4. **cn() utility** - Conditional Tailwind class merging
5. **Semantic HTML** - Proper roles, labels for accessibility
6. **ARIA attributes** - aria-label, aria-hidden, role, etc.
7. **Transition classes** - `transition-all duration-300 ease-out`

---

## 4. Tailwind Styling Patterns

### Color Token System

**Project uses custom Tailwind color tokens:**

```typescript
// tailwind.config.ts extends colors with:
colors: {
  // Warm neutrals
  warm: {
    50: '#F5F1E8',    // Lightest
    100: '#F2EEE6',
    200: '#E6E0D6',
    // ...
    900: '#2B2622',   // Darkest
  },

  // Primary coral
  primary: {
    50: '#FFF0ED',
    // ...
    500: '#E57373',   // Main color
    600: '#D32F2F',   // Darker
    // ...
  },

  // Status colors
  'status-idea': {
    50: '#F2E8CF',
    100: '#DDBEA9',
    500: '#C8A166',
    700: '#BC8A5F',
  },
  'status-success': {
    50: '#F2FCF4',
    100: '#DDF5E1',
    500: '#57C264',     // Sage green
    700: '#3A8F45',
  },
  'status-warning': {
    50: '#FFF5F2',
    100: '#FFE0D6',
    500: '#FF7D57',     // Terracotta
    700: '#CC4E29',
  },
  'status-progress': {
    50: '#F7F5FC',
    100: '#EBE6F7',
    500: '#9B82CF',     // Lavender
    700: '#6B529E',
  },
}
```

### Budget Component Color Mapping

Based on design spec + Tailwind config:

| Budget State | Design Token | Tailwind Class | Usage |
|---|---|---|---|
| Purchased | `status-success-500` | `bg-status-success-500` | Completed spending |
| Planned | `status-progress-500` | `bg-status-progress-500` | Committed spending |
| Remaining | `border-subtle` | `bg-gray-200` | Available budget |
| Over Budget | `status-warning-500` | `bg-status-warning-500` | Warning indicator |

### Common Tailwind Patterns

**Responsive sizing:**
```tsx
className="w-full sm:max-w-lg md:w-2/3 lg:w-1/2"
```

**Touch targets (44px minimum):**
```tsx
className="min-h-[44px] min-w-[44px]"
```

**Transitions:**
```tsx
className="transition-all duration-300 ease-out hover:shadow-medium"
```

**Flex layouts:**
```tsx
className="flex items-center justify-between gap-4"
```

**Rounded corners:**
```tsx
// From design tokens mapped to Tailwind
className="rounded-small"   // 8px
className="rounded-medium"  // 12px
className="rounded-large"   // 16px
className="rounded-xlarge"  // 20px
```

**Shadows:**
```tsx
className="shadow-low hover:shadow-medium"
```

**Gradients:**
```tsx
className="from-status-success-100 to-status-success-50 bg-gradient-to-r"
```

---

## 5. Accessibility Patterns

### ARIA Labels & Roles

```typescript
// Status indicator
<div
  role="progressbar"
  aria-label="Budget meter for Christmas 2025"
  aria-valuenow={spent}
  aria-valuemin={0}
  aria-valuemax={total}
/>

// Alert/Warning card
<div
  role="alert"
  aria-live="polite"
  aria-label="Budget warning: exceeds budget by $25"
/>

// Interactive button
<button
  aria-label="View budget details"
  aria-expanded={isOpen}
  aria-controls="budget-details"
/>
```

### Focus Management

```typescript
// Focus ring visible on all interactive elements
className="focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"

// Focus within containers
className="focus-within:ring-2 focus-within:border-primary-500"
```

### Color Independence

Always include text labels alongside colors:
```tsx
// Good: Text + color
<div className="flex items-center gap-2">
  <span className="w-3 h-3 rounded-full bg-status-success-500" />
  <span>Purchased: $280</span>
</div>

// Avoid: Color only
<div className="w-3 h-3 rounded-full bg-status-success-500" />
```

### Semantic HTML

```tsx
// Use semantic elements
<header>        {/* Instead of <div role="banner"> */}
<nav>           {/* Instead of <div role="navigation"> */}
<main>          {/* Instead of <div role="main"> */}
<section>       {/* Grouped content */}
<article>       {/* Self-contained content */}
<label htmlFor="input">  {/* Associate labels with inputs */}
```

---

## 6. Mobile-First Responsive Design

### Breakpoints (Tailwind Config)

```typescript
screens: {
  'xs': '375px',   // iPhone SE
  'sm': '640px',   // Small tablets
  'md': '768px',   // iPad
  'lg': '1024px',  // Laptops
  'xl': '1280px',  // Desktops
}
```

### Mobile-First Pattern

**Always start with mobile styles, then add responsive modifiers:**

```tsx
<div className="
  text-body-small              /* Mobile: 12px */
  sm:text-body-medium          /* 640px+: 14px */
  md:text-body-large           /* 768px+: 16px */

  p-4                          /* Mobile: 16px padding */
  md:p-6                       /* 768px+: 24px padding */
  lg:p-8                       /* 1024px+: 32px padding */

  flex flex-col                /* Mobile: stacked */
  md:flex-row                  /* 768px+: row layout */

  w-full                       /* Mobile: full width */
  md:max-w-md                  /* 768px+: constrained */
">
```

### Safe Areas (iOS)

```tsx
// For top notch/status bar
className="pt-safe-area-inset-top"

// For bottom home indicator
className="pb-safe-area-inset-bottom"

// In Tailwind config:
// env(safe-area-inset-top/right/bottom/left) variables available
```

### Touch Targets

```tsx
// All interactive elements must be ≥ 44x44px
<button className="min-h-[44px] min-w-[44px] px-4" />

// Even small icon buttons need 44px touch area
<button className="w-11 h-11 rounded-full" />
```

---

## 7. Real-Time WebSocket Integration

### WebSocket Hook Pattern

**For budget updates via WebSocket:**

```typescript
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

function BudgetMeterComponent({ occasionId }: { occasionId: string }) {
  // Fetch initial data
  const budget = useQuery({
    queryKey: ['budgets', occasionId],
    queryFn: () => budgetApi.get(occasionId),
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to real-time updates
  useRealtimeSync({
    topic: `budget:${occasionId}`,         // Server publishes to this topic
    queryKey: ['budgets', occasionId],     // Cache key to invalidate
    events: ['UPDATED'],                   // Event types to listen for
    debounceMs: 0,                         // No debounce for budget updates
    enabled: !!occasionId,
  });

  return <div>{/* Component JSX */}</div>;
}
```

### WebSocket Event Structure

Based on `useRealtimeSync.ts`:

```typescript
interface WSEvent {
  topic: string;                    // "budget:123"
  event: 'ADDED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED';
  data: {
    entity_id: string;
    payload: unknown;               // Budget data
    user_id: string;
  };
}
```

### Alternative: Direct Cache Update

```typescript
useRealtimeSync({
  topic: `budget:${occasionId}`,
  queryKey: ['budgets', occasionId],
  onEvent: (event, queryClient) => {
    if (event.event === 'UPDATED') {
      queryClient.setQueryData(['budgets', occasionId], (old) => {
        return { ...old, ...event.data.payload };
      });
    }
  },
});
```

### Polling Fallback

When WebSocket unavailable:

```typescript
import { usePollingFallback } from '@/hooks/useRealtimeSync';

usePollingFallback({
  queryKey: ['budgets', occasionId],
  intervalMs: 10000,  // Poll every 10s
  enabled: true,      // Disabled when WebSocket connected
});
```

---

## 8. API Integration Patterns

### API Module Structure

From `useGifts.ts`:

```typescript
// Usage in components
import { giftApi } from '@/lib/api/endpoints';

// API functions
giftApi.list(params)              // GET /api/gifts
giftApi.get(id)                   // GET /api/gifts/:id
giftApi.create(data)              // POST /api/gifts
giftApi.update(id, data)          // PATCH /api/gifts/:id
giftApi.delete(id)                // DELETE /api/gifts/:id
giftApi.createFromUrl(url)        // POST /api/gifts/from-url
```

### Expected Budget API Endpoints

For budget components, expect:

```typescript
// Fetch budget for occasion
GET /api/occasions/:id/budget
Response: {
  total: number;
  purchased: number;
  planned: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

// Update budget for occasion
PATCH /api/occasions/:id/budget
Request: { total: number }

// Get budget details with gifts breakdown
GET /api/occasions/:id/budget/breakdown
Response: {
  total: number;
  gifts: {
    purchased: Gift[];
    planned: Gift[];
  }
}
```

---

## 9. Component Composition Patterns

### Container vs Presentational

**Container (Smart):**
```typescript
// Handles data fetching, state, side effects
export function BudgetMeterContainer({ occasionId }: { occasionId: string }) {
  const budget = useQuery({
    queryKey: ['budgets', occasionId],
    queryFn: () => budgetApi.get(occasionId),
  });

  if (budget.isLoading) return <BudgetMeterSkeleton />;
  if (budget.error) return <ErrorMessage />;

  return (
    <BudgetMeterPresentation
      budget={budget.data}
      onNavigate={() => /* ... */}
    />
  );
}
```

**Presentational (Dumb):**
```typescript
// Pure UI component, receives props, renders JSX
interface BudgetMeterPresentationProps {
  budget: BudgetData;
  onNavigate?: () => void;
  className?: string;
}

export function BudgetMeterPresentation({
  budget,
  onNavigate,
  className,
}: BudgetMeterPresentationProps) {
  return (
    <div className={cn('budget-meter', className)}>
      {/* Render UI */}
    </div>
  );
}
```

### Compound Component Pattern

```typescript
// allows flexible composition
<BudgetMeter occasion={occasion}>
  <BudgetMeter.Header />
  <BudgetMeter.ProgressBar />
  <BudgetMeter.Stats />
</BudgetMeter>

// Implementation
interface BudgetMeterCompound {
  Header: React.FC<HeaderProps>;
  ProgressBar: React.FC<ProgressBarProps>;
  Stats: React.FC<StatsProps>;
}

function BudgetMeter({ children }: Props) {
  return <div>{children}</div>;
}

BudgetMeter.Header = BudgetMeterHeader;
BudgetMeter.ProgressBar = BudgetMeterProgressBar;
BudgetMeter.Stats = BudgetMeterStats;
```

---

## 10. Animation & Micro-Interactions

### Transition Classes

```tsx
// Fade + slide animations
className="transition-all duration-300 ease-out"

// Specific properties
className="transition-opacity duration-200"
className="transition-transform duration-300"

// Durations from design tokens
'duration-150'  // Fast
'duration-200'  // Default
'duration-300'  // Slow
```

### Hover/Active States

```tsx
<button className="
  bg-primary-500
  hover:bg-primary-600          /* Hover state */
  active:scale-95               /* Active/pressed */
  focus:ring-2 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-200
"
/>
```

### Keyframe Animations

Available in app globals (to be added):

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Component-Specific Animations

For budget components:

```tsx
// Segment hover lift
className="hover:scale-[1.01] transition-transform duration-200"

// Bar segment width transition
className="transition-all duration-200 ease-out"

// Tooltip enter/exit
className="animate-fadeIn duration-150"

// Warning card spring animation
className="animate-springIn duration-250"
```

---

## 11. State Management Patterns

### Query Client Context

```typescript
import { useQueryClient } from '@tanstack/react-query';

function Component() {
  const queryClient = useQueryClient();

  // Invalidate cache
  queryClient.invalidateQueries({ queryKey: ['budgets'] });

  // Get cached data
  const data = queryClient.getQueryData(['budgets', id]);

  // Set data manually
  queryClient.setQueryData(['budgets', id], newData);

  // Remove data
  queryClient.removeQueries({ queryKey: ['budgets', id] });
}
```

### Local State with useState

```typescript
'use client';

import { useState } from 'react';

export function BudgetMeter() {
  const [hoveredSegment, setHoveredSegment] = useState<'purchased' | 'planned' | 'remaining' | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsTooltipOpen(true)}
      onMouseLeave={() => {
        setIsTooltipOpen(false);
        setHoveredSegment(null);
      }}
    >
      {/* Component JSX */}
    </div>
  );
}
```

### Context for Shared State (if needed)

```typescript
// Create budget context
const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  return (
    <BudgetContext.Provider value={{ selectedOccasion, setSelectedOccasion }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext() {
  const context = useContext(BudgetContext);
  if (!context) throw new Error('Must use within BudgetProvider');
  return context;
}
```

---

## 12. Error Handling Patterns

### API Error Response Handling

```typescript
try {
  const data = await budgetApi.get(id);
} catch (error) {
  // Handle API error envelope
  const apiError = error as APIError;
  console.error(apiError.error.code);     // VALIDATION_ERROR, NOT_FOUND, etc.
  console.error(apiError.error.message);
  console.error(apiError.error.trace_id);
}
```

### Component Error States

```tsx
const budget = useQuery({
  queryKey: ['budgets', id],
  queryFn: () => budgetApi.get(id),
});

if (budget.isPending) return <LoadingSkeleton />;
if (budget.error) return <ErrorDisplay error={budget.error} />;

return <BudgetDisplay data={budget.data} />;
```

### Error Boundaries

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="p-4 bg-status-warning-50 border border-status-warning-500 rounded-large">
      <h2 className="font-bold text-status-warning-800">Something went wrong</h2>
      <p className="text-status-warning-700">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-medium"
      >
        Try again
      </button>
    </div>
  );
}
```

---

## 13. Testing Patterns

### Component Test Pattern

```typescript
// __tests__/components/BudgetMeter.test.tsx
import { render, screen } from '@testing-library/react';
import { BudgetMeter } from '@/components/budget/BudgetMeter';

test('renders budget meter with segments', () => {
  const props = {
    occasionName: 'Christmas 2025',
    totalBudget: 500,
    purchasedAmount: 280,
    plannedAmount: 120,
  };

  render(<BudgetMeter {...props} />);

  expect(screen.getByText('Christmas 2025')).toBeInTheDocument();
  expect(screen.getByText('Budget: $500')).toBeInTheDocument();
});

test('displays warning when over budget', () => {
  const props = {
    // ... props that result in over budget
  };

  render(<BudgetMeter {...props} />);
  expect(screen.getByRole('alert')).toHaveClass('status-warning');
});
```

---

## 14. Implementation Checklist for Budget Components

### BudgetMeterComponent

- [ ] Use CVA for variant styling
- [ ] Implement three segments (purchased, planned, remaining)
- [ ] Add percentage calculation
- [ ] Color map to design tokens (status-success-500, status-progress-500, etc.)
- [ ] Responsive: stack amounts on mobile
- [ ] Touch target: 44px minimum
- [ ] ARIA labels with budget summary
- [ ] Hover state with scale transform
- [ ] Transitions: width 200ms ease-out
- [ ] Show warning state when over budget

### BudgetTooltip Component

- [ ] Position absolutely, below segment
- [ ] Glass background with blur effect
- [ ] Arrow pointer to segment
- [ ] Scrollable gift list (max 5-6 visible)
- [ ] Gift item: avatar + name + price + recipient
- [ ] Mobile: convert to bottom sheet
- [ ] Animation: fade + slide up (150ms)
- [ ] Show "+X more gifts" footer
- [ ] Accessibility: focus trap in modal version

### BudgetWarningCard Component

- [ ] Background: status-warning-50
- [ ] Border: 2px status-warning-500
- [ ] Icon: ⚠️ (24px)
- [ ] Dynamic message: "This gift ($XX) would exceed..."
- [ ] Optional action buttons (Adjust Budget, Continue Anyway)
- [ ] Animation: scale-in with spring easing
- [ ] Role="alert" with aria-live="polite"
- [ ] Non-blocking (informational only)
- [ ] Dismissible with fade out

---

## 15. Design System References

### Key Documentation Files

1. **docs/designs/budget-progression-meter-ui-spec.md** (1320 lines)
   - Complete visual specifications for all budget components
   - Color mappings, responsive breakpoints, animations
   - Component props interfaces

2. **docs/designs/COMPONENTS.md** (400+ lines)
   - Card, Button, Input specifications
   - Status Pills, Modals, Loading states
   - Accessibility patterns

3. **docs/designs/DESIGN-TOKENS.md** (600+ lines)
   - Complete token values (colors, spacing, typography)
   - CSS custom properties
   - Tailwind configuration

4. **apps/web/CLAUDE.md** (490 lines)
   - Frontend architecture and patterns
   - React Query setup
   - WebSocket integration
   - Mobile-first guidelines

---

## 16. Common Gotchas & Best Practices

### ✓ DO

- Use React.forwardRef for component refs
- Include aria-label on all interactive elements
- Use 'use client' for interactive components
- Wrap text colors with status color classes
- Implement 44px touch targets
- Use CVA for component variants
- Add role="progressbar" or role="alert" for semantic meaning
- Keep transitions to 200-300ms for snappy feel
- Cache data with 5-minute staleTime
- Subscribe to WebSocket after initial data load

### ✗ DON'T

- Hardcode colors (use Tailwind tokens)
- Mix styles (inline + Tailwind)
- Use custom CSS unless absolutely necessary
- Skip aria-label for status indicators
- Make buttons smaller than 44px
- Use flexbox without justify/align classes
- Re-fetch data unnecessarily (use staleTime)
- Put all logic in render method
- Ignore mobile-first responsive design
- Forget refetchOnWindowFocus for interactive features

---

## 17. Files to Reference

### Component Examples
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/ui/card.tsx`
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/components/ui/status-pill.tsx`

### Hook Examples
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useGifts.ts`
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/hooks/useRealtimeSync.ts`

### Configuration Files
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/tailwind.config.ts`
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web/next.config.ts`

### Design Documentation
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/designs/budget-progression-meter-ui-spec.md`
- `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/designs/DESIGN-TOKENS.md`

---

## 18. Next Steps for Implementation

1. **Create budget hooks** - `hooks/useBudget.ts`, `hooks/useBudgetBreakdown.ts`
2. **Create UI components** - In `components/budget/` directory
   - BudgetMeter.tsx
   - BudgetTooltip.tsx
   - BudgetWarningCard.tsx
   - BudgetContextSidebar.tsx
3. **Integrate with React Query** - Follow useGifts.ts pattern
4. **Add WebSocket sync** - Use useRealtimeSync for real-time updates
5. **Implement responsive design** - Mobile-first with md/lg breakpoints
6. **Add accessibility** - ARIA labels, focus management, keyboard nav
7. **Write tests** - Unit tests for calculations, integration tests for API
8. **Add animations** - Transitions and keyframes from design spec

---

## Summary

The Family Gifting Dashboard frontend uses:
- **React Query** for data management with 5-minute cache
- **Tailwind CSS** with custom design tokens and CVA for variants
- **Next.js App Router** for pages and server components
- **WebSocket real-time sync** via useRealtimeSync hook
- **Mobile-first responsive design** with 44px touch targets
- **Semantic HTML + ARIA** for accessibility
- **Component composition** with forwardRef and variants

Budget components should follow these exact patterns to maintain consistency across the codebase.

---

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-04
**Report Generated by:** Codebase Explorer
