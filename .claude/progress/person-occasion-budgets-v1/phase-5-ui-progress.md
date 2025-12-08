---
type: progress
prd: person-occasion-budgets-v1
phase: 5
phase_name: UI Components & Pages
status: not_started
progress: 0
total_tasks: 8
completed_tasks: 0
story_points: 25
estimated_duration: 2 days
tasks:
  - id: UI-001
    title: Create PersonOccasionBudgetCard component
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [HOOK-004]
    story_points: 5
    files:
      - apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx
    description: Display budget with progress bar, amount, and notes
  - id: UI-002
    title: Add budget inputs with auto-save
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [UI-001, HOOK-004]
    story_points: 4
    files:
      - apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx
    description: Inline editing with debounced save using mutation hook
  - id: UI-003
    title: Wire to PersonBudgetBar with occasion context
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [UI-001]
    story_points: 3
    files:
      - apps/web/src/components/budgets/PersonBudgetBar.tsx
    description: Extend PersonBudgetBar to accept occasion_id prop
  - id: UI-004
    title: Integrate into OccasionRecipientsSection
    status: pending
    assigned_to: frontend-developer
    dependencies: [UI-003]
    story_points: 3
    files:
      - apps/web/src/components/occasions/OccasionRecipientsSection.tsx
    description: Display PersonBudgetBar for each recipient with occasion filter
  - id: UI-005
    title: Create PersonBudgetsTab component
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [UI-001]
    story_points: 4
    files:
      - apps/web/src/components/persons/PersonBudgetsTab.tsx
    description: Tab showing budgets across all occasions for a person
  - id: UI-006
    title: Add to PersonDetailModal
    status: pending
    assigned_to: frontend-developer
    dependencies: [UI-005]
    story_points: 2
    files:
      - apps/web/src/components/persons/PersonDetailModal.tsx
    description: Add PersonBudgetsTab to person modal tabs
  - id: UI-007
    title: Add over-budget warnings
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [UI-001]
    story_points: 2
    files:
      - apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx
      - apps/web/src/components/budgets/PersonBudgetBar.tsx
    description: Visual indicators when budget exceeded
  - id: UI-008
    title: Write component tests
    status: pending
    assigned_to: frontend-developer
    dependencies: [UI-001, UI-002, UI-003, UI-005, UI-007]
    story_points: 2
    files:
      - apps/web/src/components/budgets/__tests__/PersonOccasionBudgetCard.test.tsx
      - apps/web/src/components/budgets/__tests__/PersonBudgetBar.test.tsx
    description: Component tests with React Testing Library
---

# Phase 5: UI Components & Pages

**Status**: Not Started
**Last Updated**: 2025-12-07
**Completion**: 0%
**Story Points**: 25 / 25 remaining
**Estimated Duration**: 2 days

## Overview

Build UI components and integrate person-occasion budgets into the app. Components follow Radix UI + Tailwind patterns, support mobile-first responsive design, and use React Query hooks from Phase 4.

## Parallelization Strategy

### Batch 1: Core Budget Card (Sequential - 9 story points, 0.75 days)
- UI-001: PersonOccasionBudgetCard component (5 pts)
- UI-002: Budget inputs with auto-save (4 pts, depends on UI-001)

### Batch 2: Integration Components (Parallel after UI-001 - 10 story points, 0.75 days)
Can run in parallel after UI-001:
- UI-003: Wire PersonBudgetBar with occasion context (3 pts)
- UI-005: PersonBudgetsTab component (4 pts)
- UI-007: Over-budget warnings (2 pts, can integrate with UI-001)

### Batch 3: Page Integration (Sequential - 5 story points, 0.25 days)
- UI-004: Integrate into OccasionRecipientsSection (3 pts, depends on UI-003)
- UI-006: Add to PersonDetailModal (2 pts, depends on UI-005)

### Batch 4: Testing (Sequential - 2 story points, 0.25 days)
- UI-008: Component tests (depends on all UI tasks)

**Total Duration**: 2 days (with some parallelization)

## Tasks

### UI-001: Create PersonOccasionBudgetCard Component ⏳ Pending
**Story Points**: 5
**Assigned To**: ui-engineer-enhanced
**Dependencies**: HOOK-004
**Files**: `apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx`

**Description**:
Core component displaying person-occasion budget with progress bar, amounts, and metadata.

**Component Spec**:
```typescript
interface PersonOccasionBudgetCardProps {
  personId: number;
  occasionId: number;
  showEdit?: boolean;  // Enable inline editing
}

export function PersonOccasionBudgetCard({
  personId,
  occasionId,
  showEdit = false,
}: PersonOccasionBudgetCardProps) {
  const { data: budget, isLoading } = usePersonOccasionBudget(personId, occasionId);

  // ... component implementation
}
```

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Budget: $100.00 USD                 │
│ ─────────────█████─────── 50%      │
│ Spent: $50.00 | Remaining: $50.00  │
│ Notes: Christmas budget             │
└─────────────────────────────────────┘
```

**UI Elements**:
- Budget amount display (or "No budget set")
- Progress bar (StackedProgressBar or similar)
- Spent / Remaining amounts
- Budget notes (if set)
- Loading state skeleton
- Empty state for no budget

**Acceptance Criteria**:
- [ ] Fetches budget using usePersonOccasionBudget hook
- [ ] Displays budget amount, spent, remaining
- [ ] Shows progress bar visualization
- [ ] Displays budget notes if present
- [ ] Shows "No budget set" when budget_amount is null
- [ ] Loading state with skeleton
- [ ] Mobile-first responsive (44px touch targets)
- [ ] Accessible (ARIA labels, keyboard navigation)
- [ ] Follows Tailwind + Radix patterns

---

### UI-002: Add Budget Inputs with Auto-Save ⏳ Pending
**Story Points**: 4
**Assigned To**: ui-engineer-enhanced
**Dependencies**: UI-001, HOOK-004
**Files**: `apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx`

**Description**:
Add inline editing to PersonOccasionBudgetCard with debounced auto-save.

**Editing Features**:
- Click to edit budget amount (input field)
- Currency selector (dropdown)
- Notes textarea
- Auto-save after 1 second of inactivity (debounce)
- Optimistic updates via mutation hook
- Validation feedback

**Implementation Pattern**:
```typescript
const { mutate, isPending } = useUpdatePersonOccasionBudget(personId, occasionId);
const [amount, setAmount] = useState(budget?.budget_amount || '');

// Debounced save
const debouncedSave = useMemo(
  () => debounce((value: string) => {
    mutate({ budget_amount: value });
  }, 1000),
  [mutate]
);

const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setAmount(value);
  debouncedSave(value);
};
```

**Acceptance Criteria**:
- [ ] Inline editing enabled when showEdit=true
- [ ] Budget amount input (numeric, 2 decimal places)
- [ ] Currency selector (defaults to USD)
- [ ] Notes textarea
- [ ] Debounced auto-save (1 second)
- [ ] Uses useUpdatePersonOccasionBudget mutation
- [ ] Optimistic updates (instant UI feedback)
- [ ] Saving indicator (spinner/loading state)
- [ ] Validation errors displayed inline
- [ ] Mobile-friendly input fields

---

### UI-003: Wire to PersonBudgetBar with Occasion Context ⏳ Pending
**Story Points**: 3
**Assigned To**: ui-engineer-enhanced
**Dependencies**: UI-001
**Files**: `apps/web/src/components/budgets/PersonBudgetBar.tsx`

**Description**:
Extend existing PersonBudgetBar component to accept optional occasion_id prop for occasion-specific budget display.

**Current (assumed) Props**:
```typescript
interface PersonBudgetBarProps {
  personId: number;
  // Shows total budget across all occasions
}
```

**New Props**:
```typescript
interface PersonBudgetBarProps {
  personId: number;
  occasionId?: number;  // NEW: filter by occasion
  // If occasionId provided: shows budget for that occasion
  // If occasionId null: shows total across all occasions (existing behavior)
}
```

**Implementation**:
```typescript
export function PersonBudgetBar({ personId, occasionId }: PersonBudgetBarProps) {
  // If occasionId provided, use usePersonOccasionBudget
  // Else, use existing total budget logic

  if (occasionId !== undefined) {
    const { data: budget } = usePersonOccasionBudget(personId, occasionId);
    // Render occasion-specific budget bar
  } else {
    // Existing total budget logic
  }
}
```

**Acceptance Criteria**:
- [ ] Adds optional occasionId prop
- [ ] Uses usePersonOccasionBudget when occasionId provided
- [ ] Maintains backward compatibility (no occasionId = total budget)
- [ ] Shows occasion-specific budget progress
- [ ] Updates existing PersonBudgetBar without breaking current usage
- [ ] Mobile-responsive
- [ ] Accessible

---

### UI-004: Integrate into OccasionRecipientsSection ⏳ Pending
**Story Points**: 3
**Assigned To**: frontend-developer
**Dependencies**: UI-003
**Files**: `apps/web/src/components/occasions/OccasionRecipientsSection.tsx`

**Description**:
Display PersonBudgetBar for each recipient in the occasion recipients section, filtered by occasion.

**Integration Point**:
```typescript
// apps/web/src/components/occasions/OccasionRecipientsSection.tsx

export function OccasionRecipientsSection({ occasionId }: Props) {
  const { data: recipients } = useOccasionRecipients(occasionId);

  return (
    <div>
      {recipients?.map(recipient => (
        <div key={recipient.person_id}>
          <PersonCard person={recipient} />
          {/* NEW: Budget bar filtered by occasion */}
          <PersonBudgetBar
            personId={recipient.person_id}
            occasionId={occasionId}
          />
        </div>
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] PersonBudgetBar displayed for each recipient
- [ ] occasionId passed to filter budget
- [ ] Shows per-person, per-occasion budget progress
- [ ] Maintains existing recipient card layout
- [ ] Mobile-responsive
- [ ] No performance degradation (efficient queries)

---

### UI-005: Create PersonBudgetsTab Component ⏳ Pending
**Story Points**: 4
**Assigned To**: ui-engineer-enhanced
**Dependencies**: UI-001
**Files**: `apps/web/src/components/persons/PersonBudgetsTab.tsx`

**Description**:
Create tab component showing all budgets for a person across all occasions.

**Component Spec**:
```typescript
interface PersonBudgetsTabProps {
  personId: number;
}

export function PersonBudgetsTab({ personId }: PersonBudgetsTabProps) {
  const { data: occasions } = useOccasions();
  const { data: personOccasions } = usePersonOccasions(personId);

  return (
    <div>
      <h3>Budgets by Occasion</h3>
      {personOccasions?.map(po => (
        <PersonOccasionBudgetCard
          key={po.occasion_id}
          personId={personId}
          occasionId={po.occasion_id}
          showEdit={true}
        />
      ))}
    </div>
  );
}
```

**Visual Layout**:
```
┌─────────────────────────────────────┐
│ Budgets by Occasion                 │
├─────────────────────────────────────┤
│ Christmas 2025                      │
│ Budget: $150.00 | Spent: $75.00    │
│ ████████████░░░░░░░░ 50%           │
├─────────────────────────────────────┤
│ Birthday 2025                       │
│ Budget: $50.00 | Spent: $50.00     │
│ ████████████████████ 100%          │
│ ⚠️ Over budget!                     │
├─────────────────────────────────────┤
│ Anniversary                         │
│ No budget set                       │
└─────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Lists all occasions for the person
- [ ] Shows PersonOccasionBudgetCard for each occasion
- [ ] Enable inline editing (showEdit=true)
- [ ] Groups by occasion (occasion name displayed)
- [ ] Shows "No budget set" for occasions without budgets
- [ ] Sorted by occasion date (upcoming first)
- [ ] Mobile-responsive list
- [ ] Empty state if person has no occasions

---

### UI-006: Add to PersonDetailModal ⏳ Pending
**Story Points**: 2
**Assigned To**: frontend-developer
**Dependencies**: UI-005
**Files**: `apps/web/src/components/persons/PersonDetailModal.tsx`

**Description**:
Add PersonBudgetsTab as a new tab in the PersonDetailModal.

**Tab Integration**:
```typescript
// apps/web/src/components/persons/PersonDetailModal.tsx

export function PersonDetailModal({ personId, isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="gifts">Gifts</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>  {/* NEW */}
        </TabsList>

        <TabsContent value="details">
          <PersonDetailsTab personId={personId} />
        </TabsContent>

        <TabsContent value="gifts">
          <PersonGiftsTab personId={personId} />
        </TabsContent>

        <TabsContent value="budgets">  {/* NEW */}
          <PersonBudgetsTab personId={personId} />
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
```

**Acceptance Criteria**:
- [ ] "Budgets" tab added to PersonDetailModal
- [ ] PersonBudgetsTab rendered in tab content
- [ ] Tab follows existing Radix Tabs patterns
- [ ] Tab accessible (keyboard navigation, ARIA)
- [ ] Mobile-responsive modal tabs
- [ ] No visual regressions in existing tabs

---

### UI-007: Add Over-Budget Warnings ⏳ Pending
**Story Points**: 2
**Assigned To**: ui-engineer-enhanced
**Dependencies**: UI-001
**Files**:
- `apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx`
- `apps/web/src/components/budgets/PersonBudgetBar.tsx`

**Description**:
Add visual indicators when budget is exceeded.

**Warning Triggers**:
- `is_over_budget === true` (from backend DTO)
- `budget_spent > budget_amount`

**Visual Indicators**:

**PersonOccasionBudgetCard**:
```tsx
{budget.is_over_budget && (
  <Alert variant="warning">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Budget exceeded by ${parseFloat(budget.budget_spent) - parseFloat(budget.budget_amount || '0')}.toFixed(2)}
    </AlertDescription>
  </Alert>
)}
```

**PersonBudgetBar**:
```tsx
<div className={cn(
  "progress-bar",
  budget.is_over_budget && "bg-red-500 border-red-600"
)}>
  {/* Progress bar fills beyond 100% (show overflow) */}
</div>
```

**Acceptance Criteria**:
- [ ] Warning alert shown in PersonOccasionBudgetCard when over budget
- [ ] Progress bar color changes to red when over budget
- [ ] Shows amount over budget in warning
- [ ] Warning dismissible or inline (not blocking)
- [ ] Mobile-friendly warning display
- [ ] Accessible (ARIA role="alert")
- [ ] Consistent warning styling across components

---

### UI-008: Write Component Tests ⏳ Pending
**Story Points**: 2
**Assigned To**: frontend-developer
**Dependencies**: UI-001, UI-002, UI-003, UI-005, UI-007
**Files**:
- `apps/web/src/components/budgets/__tests__/PersonOccasionBudgetCard.test.tsx`
- `apps/web/src/components/budgets/__tests__/PersonBudgetBar.test.tsx`

**Description**:
Comprehensive component tests using React Testing Library and MSW.

**Test Coverage**:

**PersonOccasionBudgetCard Tests**:
- `test_renders_budget_display`: Shows budget, spent, remaining
- `test_renders_no_budget_state`: Shows "No budget set"
- `test_loading_state`: Shows skeleton while loading
- `test_inline_editing`: Input fields work, auto-save triggers
- `test_over_budget_warning`: Warning displayed when over budget
- `test_optimistic_update`: UI updates immediately on edit
- `test_validation_error`: Shows error for invalid input

**PersonBudgetBar Tests**:
- `test_renders_total_budget`: No occasionId shows total
- `test_renders_occasion_budget`: occasionId filters correctly
- `test_progress_bar_percentage`: Progress calculated correctly
- `test_over_budget_styling`: Red styling when over budget

**PersonBudgetsTab Tests**:
- `test_renders_all_occasions`: Lists all person-occasion budgets
- `test_empty_state`: Shows message when no occasions

**Test Implementation Pattern**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PersonOccasionBudgetCard', () => {
  test('renders budget display', async () => {
    server.use(
      http.get('/api/v1/persons/1/occasions/2/budget', () => {
        return HttpResponse.json({
          budget_amount: "100.00",
          budget_spent: "50.00",
          budget_remaining: "50.00",
          // ... other fields
        });
      })
    );

    render(<PersonOccasionBudgetCard personId={1} occasionId={2} />);

    await waitFor(() => {
      expect(screen.getByText(/Budget: \$100.00/)).toBeInTheDocument();
    });
  });

  // ... more tests
});
```

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Tests use React Testing Library
- [ ] Tests use MSW for API mocking
- [ ] Tests cover user interactions (clicks, typing)
- [ ] Tests verify accessibility (ARIA, roles)
- [ ] Tests follow existing test patterns
- [ ] >80% code coverage for new components

---

## Quick Reference

### Pre-built Task Commands

```python
# UI-001: Create PersonOccasionBudgetCard component
Task("ui-engineer-enhanced", """
Create PersonOccasionBudgetCard component.

File: apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx

Component spec:
- Props: personId, occasionId, showEdit (optional)
- Fetches budget using usePersonOccasionBudget hook
- Displays: budget amount, spent, remaining, progress bar, notes
- Shows "No budget set" when budget_amount is null
- Loading state with skeleton
- Mobile-first responsive (44px touch targets)
- Accessible (ARIA labels)

UI elements:
- Budget amount display
- Progress bar (use StackedProgressBar or create simple one)
- Spent / Remaining amounts
- Budget notes (if present)

Follow Radix UI + Tailwind patterns in codebase.
Reference: apps/web/src/components/ for existing patterns.
""")

# UI-002: Add budget inputs with auto-save
Task("ui-engineer-enhanced", """
Add inline editing to PersonOccasionBudgetCard with auto-save.

File: apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx

Features:
- Click to edit budget amount (input field)
- Currency selector (dropdown, default USD)
- Notes textarea
- Auto-save after 1 second of inactivity (debounce)
- Uses useUpdatePersonOccasionBudget mutation hook
- Optimistic updates (instant UI feedback)
- Validation errors displayed inline
- Saving indicator

Implementation:
- Use useMemo for debounced save function
- Local state for input values
- Trigger mutation on debounced change
- Mobile-friendly inputs

Reference: Look for existing auto-save patterns in codebase.
""")

# UI-003: Wire PersonBudgetBar with occasion context
Task("ui-engineer-enhanced", """
Extend PersonBudgetBar to support occasion-specific budgets.

File: apps/web/src/components/budgets/PersonBudgetBar.tsx

Changes:
- Add optional occasionId prop
- When occasionId provided: use usePersonOccasionBudget hook
- When occasionId null/undefined: use existing total budget logic (backward compatible)
- Render budget bar based on filtered data

Props:
interface PersonBudgetBarProps {
  personId: number;
  occasionId?: number;
}

Maintain backward compatibility with existing usage.
""")

# UI-004: Integrate into OccasionRecipientsSection
Task("frontend-developer", """
Add PersonBudgetBar to OccasionRecipientsSection.

File: apps/web/src/components/occasions/OccasionRecipientsSection.tsx

Integration:
- Import PersonBudgetBar
- Render for each recipient
- Pass occasionId prop to filter budget
- Maintain existing recipient card layout
- Ensure mobile-responsive

Pattern:
{recipients?.map(recipient => (
  <div key={recipient.person_id}>
    <PersonCard person={recipient} />
    <PersonBudgetBar personId={recipient.person_id} occasionId={occasionId} />
  </div>
))}
""")

# UI-005: Create PersonBudgetsTab component
Task("ui-engineer-enhanced", """
Create PersonBudgetsTab showing budgets across all occasions.

File: apps/web/src/components/persons/PersonBudgetsTab.tsx

Component spec:
- Props: personId
- Fetches person's occasions
- Renders PersonOccasionBudgetCard for each occasion
- Enable inline editing (showEdit=true)
- Shows occasion name for each budget
- Sorted by occasion date (upcoming first)
- Empty state if no occasions

Layout:
- List/grid of PersonOccasionBudgetCard components
- Mobile-responsive
- Accessible

Reference existing tab components in apps/web/src/components/persons/
""")

# UI-006: Add to PersonDetailModal
Task("frontend-developer", """
Add PersonBudgetsTab to PersonDetailModal.

File: apps/web/src/components/persons/PersonDetailModal.tsx

Changes:
- Add "Budgets" tab to TabsList
- Add TabsContent for PersonBudgetsTab
- Follow existing Radix Tabs patterns in modal
- Ensure tab accessible (keyboard nav, ARIA)
- Mobile-responsive

Integration:
<TabsTrigger value="budgets">Budgets</TabsTrigger>
<TabsContent value="budgets">
  <PersonBudgetsTab personId={personId} />
</TabsContent>
""")

# UI-007: Add over-budget warnings
Task("ui-engineer-enhanced", """
Add over-budget warnings to budget components.

Files:
- apps/web/src/components/budgets/PersonOccasionBudgetCard.tsx
- apps/web/src/components/budgets/PersonBudgetBar.tsx

Warnings:
- Trigger: is_over_budget === true
- PersonOccasionBudgetCard: Show alert with amount over budget
- PersonBudgetBar: Red progress bar when over budget
- Accessible (ARIA role="alert")
- Mobile-friendly display

Use Radix Alert component or similar.
Follow existing warning/error patterns in codebase.
""")

# UI-008: Write component tests
Task("frontend-developer", """
Write component tests for budget UI components.

Files:
- apps/web/src/components/budgets/__tests__/PersonOccasionBudgetCard.test.tsx
- apps/web/src/components/budgets/__tests__/PersonBudgetBar.test.tsx

Tests:
PersonOccasionBudgetCard:
- Renders budget display
- Renders no budget state
- Loading state
- Inline editing, auto-save
- Over-budget warning
- Optimistic update
- Validation error

PersonBudgetBar:
- Renders total budget
- Renders occasion budget
- Progress percentage
- Over-budget styling

Use React Testing Library, MSW, QueryClientProvider wrapper.
Follow existing test patterns in apps/web/src/components/__tests__/
""")
```

### File Locations

```
apps/web/
└── src/
    └── components/
        ├── budgets/
        │   ├── PersonOccasionBudgetCard.tsx          # UI-001, UI-002, UI-007
        │   ├── PersonBudgetBar.tsx                   # UI-003, UI-007
        │   └── __tests__/
        │       ├── PersonOccasionBudgetCard.test.tsx # UI-008
        │       └── PersonBudgetBar.test.tsx          # UI-008
        ├── occasions/
        │   └── OccasionRecipientsSection.tsx         # UI-004
        └── persons/
            ├── PersonBudgetsTab.tsx                  # UI-005
            └── PersonDetailModal.tsx                 # UI-006
```

### Testing Commands

```bash
# Navigate to web app
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web

# Run component tests
npm test -- PersonOccasionBudgetCard.test.tsx
npm test -- PersonBudgetBar.test.tsx

# Run all budget tests
npm test -- components/budgets/__tests__

# Run with coverage
npm test -- components/budgets/__tests__ --coverage

# Visual regression (if Storybook setup)
npm run storybook
```

## Context for AI Agents

### Design System Patterns

**Radix UI Components**:
- Dialog: Modals
- Tabs: Tab navigation
- Alert: Warning messages
- Progress: Progress bars (or custom)

**Tailwind Styling**:
- Mobile-first: `class="..."` then `md:...` `lg:...`
- Touch targets: `min-h-[44px] min-w-[44px]`
- Safe areas: `pb-[env(safe-area-inset-bottom)]`

### Component Composition

```
OccasionRecipientsSection
└── PersonCard (existing)
└── PersonBudgetBar (extended with occasionId)
    └── usePersonOccasionBudget hook

PersonDetailModal
└── Tabs
    └── PersonBudgetsTab
        └── PersonOccasionBudgetCard (multiple)
            └── usePersonOccasionBudget hook
            └── useUpdatePersonOccasionBudget hook
```

### Auto-Save Pattern

**Debounced Save**:
```typescript
import { useMemo, useState } from 'react';
import { debounce } from 'lodash-es';  // or custom implementation

const debouncedSave = useMemo(
  () => debounce((value: string) => {
    mutate({ budget_amount: value });
  }, 1000),
  [mutate]
);

// Cleanup on unmount
useEffect(() => {
  return () => {
    debouncedSave.cancel();
  };
}, [debouncedSave]);
```

**Benefits**:
- Reduces API calls (wait for user to stop typing)
- Optimistic updates still instant (local state)
- Better UX than manual save button

### Responsive Design

**Mobile-First Breakpoints**:
- Default: Mobile (320px+)
- `sm:`: 640px+
- `md:`: 768px+
- `lg:`: 1024px+

**Touch Targets**:
- Buttons: `min-h-[44px] min-w-[44px]`
- Inputs: `h-12 px-4`

**Safe Areas** (iOS):
```css
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

### Accessibility Checklist

- [ ] Semantic HTML (`<button>`, not `<div onClick>`)
- [ ] ARIA labels for icons (`aria-label="Edit budget"`)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators (`focus:ring-2`)
- [ ] Screen reader text (`sr-only` class)
- [ ] Color contrast (WCAG AA: 4.5:1 for text)
- [ ] Error announcements (`role="alert"`)

### Progress Bar Visualization

**Options**:
1. **Use existing StackedProgressBar** (if it fits)
2. **Create simple Progress component**:

```tsx
function BudgetProgress({ spent, total }: { spent: number; total: number | null }) {
  if (total === null) return <div>No budget set</div>;

  const percentage = Math.min((spent / total) * 100, 100);
  const isOver = spent > total;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={cn(
          "h-2 rounded-full transition-all",
          isOver ? "bg-red-500" : "bg-blue-500"
        )}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={spent}
        aria-valuemin={0}
        aria-valuemax={total}
      />
    </div>
  );
}
```

## Integration Points

### Consumed By
- **Occasion Pages**: Display recipient budgets
- **Person Pages**: Display budgets across occasions
- **Dashboard**: Overview of all budgets

### Consumes
- **Hooks** (Phase 4): usePersonOccasionBudget, useUpdatePersonOccasionBudget
- **Types**: PersonOccasionBudget, PersonOccasionBudgetUpdate
- **Existing Components**: PersonCard, OccasionCard, Tabs, Dialog

### State Management
- **React Query**: All server state (budgets, occasions, persons)
- **Local State**: Input values, edit mode, loading indicators
- **No global state needed** (single-tenant, simple UI state)

## Next Steps

After Phase 5 completion:
1. Proceed to Phase 6: Testing & Polish
2. End-to-end tests for user workflows
3. Accessibility audit
4. Performance testing
5. User acceptance testing

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **Phase 4**: `.claude/progress/person-occasion-budgets-v1/phase-4-hooks-progress.md`
- **Frontend Patterns**: `apps/web/CLAUDE.md`
- **Radix UI**: https://radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
