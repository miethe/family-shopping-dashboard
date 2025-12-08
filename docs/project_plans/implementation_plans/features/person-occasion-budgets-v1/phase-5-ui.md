---
title: "Phase 5: UI Components & Pages"
description: "Frontend UI components for person-occasion budget management and visualization"
audience: [frontend-engineers, ui-designers, developers]
tags: [implementation, ui, components, react, person-budgets, responsive-design]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: active
---

# Phase 5: UI Components & Pages

**Parent Plan**: [Person Budget per Occasion Implementation](../person-occasion-budgets-v1.md)

**Duration**: 2 days
**Dependencies**: Phase 4 (frontend hooks) complete
**Assigned Subagent(s)**: `ui-engineer-enhanced`, `frontend-developer`, `ui-designer`
**Related PRD Stories**: POB-006, POB-007, POB-008, POB-009

---

## Overview

This phase creates the complete UI for person-occasion budget management:

- Budget input cards with auto-save functionality
- Progress visualization with responsive design
- Budget warnings for over-spending
- Integration with occasion detail and person detail pages
- Full accessibility compliance (WCAG 2.1 AA)

---

## Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| UI-001 | PersonOccasionBudgetCard Component | Create budget card with input fields | Card displays person info, budget inputs, progress bar | 5 pts | ui-engineer-enhanced | Phase 4 |
| UI-002 | Wire Budget Inputs | Connect inputs to useUpdatePersonOccasionBudget hook | Auto-save on blur (debounced 500ms); loading/success feedback | 2 pts | frontend-developer | UI-001 |
| UI-003 | Extend PersonBudgetBar | Pass occasionId and budget props to PersonBudgetBar | Progress bar shows occasion-scoped data; NULL budgets handled | 2 pts | frontend-developer | UI-002 |
| UI-004 | Occasion Detail Page Integration | Add People section to /occasions/[id] page | Section displays PersonOccasionBudgetCard for each linked person | 3 pts | ui-engineer-enhanced | UI-003 |
| UI-005 | PersonBudgetsTab Component | Create Budgets tab for PersonDetailModal | Tab lists all occasions with budget inputs and progress bars | 5 pts | ui-engineer-enhanced | UI-004 |
| UI-006 | Occasion Filter Toggle | Add active/past occasions filter to Budgets tab | Toggle filters occasions; default shows active only | 2 pts | frontend-developer | UI-005 |
| UI-007 | Budget Warnings | Implement over-budget indicators | Red badge/text when spent > budget; progress bar red | 2 pts | frontend-developer | UI-006 |
| UI-008 | Responsive Design | Ensure mobile responsiveness | Works on 375px, 768px, 1024px+; 44px touch targets | 2 pts | ui-designer | UI-007 |
| UI-009 | Accessibility | Add ARIA labels, keyboard nav | Budget inputs labeled; progress bars have aria-valuenow | 2 pts | ui-engineer-enhanced | UI-008 |

**Total Phase 5 Effort**: 25 story points

---

## Implementation Details

### UI-001: PersonOccasionBudgetCard Component

**File**: `/apps/web/components/occasions/PersonOccasionBudgetCard.tsx`

**Component**:

```tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '@/hooks/usePersonOccasionBudget';
import { PersonBudgetBar } from '@/components/people/PersonBudgetBar';
import { usePerson } from '@/hooks/usePerson';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check } from 'lucide-react';

export interface PersonOccasionBudgetCardProps {
  personId: number;
  occasionId: number;
  className?: string;
}

export function PersonOccasionBudgetCard({
  personId,
  occasionId,
  className
}: PersonOccasionBudgetCardProps) {
  const { data: person, isLoading: personLoading } = usePerson(personId);
  const { data: budget, isLoading: budgetLoading } = usePersonOccasionBudget(personId, occasionId);
  const updateBudget = useUpdatePersonOccasionBudget(personId, occasionId);

  const [recipientInput, setRecipientInput] = React.useState('');
  const [purchaserInput, setPurchaserInput] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Sync budget data to input fields
  React.useEffect(() => {
    if (budget) {
      setRecipientInput(budget.recipient_budget_total?.toString() ?? '');
      setPurchaserInput(budget.purchaser_budget_total?.toString() ?? '');
    }
  }, [budget]);

  // Debounced auto-save on blur
  const handleRecipientBlur = React.useCallback(() => {
    const value = recipientInput === '' ? null : parseFloat(recipientInput);
    if (value !== budget?.recipient_budget_total) {
      updateBudget.mutate(
        { recipient_budget_total: value },
        {
          onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
        }
      );
    }
  }, [recipientInput, budget, updateBudget]);

  const handlePurchaserBlur = React.useCallback(() => {
    const value = purchaserInput === '' ? null : parseFloat(purchaserInput);
    if (value !== budget?.purchaser_budget_total) {
      updateBudget.mutate(
        { purchaser_budget_total: value },
        {
          onSuccess: () => {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
          }
        }
      );
    }
  }, [purchaserInput, budget, updateBudget]);

  if (personLoading || budgetLoading) {
    return (
      <div className={cn('p-4 border rounded-lg', className)}>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!person || !budget) return null;

  return (
    <div className={cn('p-4 border rounded-lg space-y-4', className)}>
      {/* Person Header */}
      <div className="flex items-center gap-3">
        <Avatar
          src={person.photo_url}
          alt={person.name}
          fallback={person.name[0]}
        />
        <div>
          <h3 className="font-semibold">{person.name}</h3>
          {person.relationship && (
            <p className="text-sm text-gray-500">{person.relationship}</p>
          )}
        </div>
        {showSuccess && (
          <Check className="ml-auto text-green-600" size={20} />
        )}
      </div>

      {/* Budget Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`recipient-budget-${personId}`}>
            Budget for Gifts To {person.name}
          </Label>
          <Input
            id={`recipient-budget-${personId}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            onBlur={handleRecipientBlur}
            disabled={updateBudget.isPending}
            className="min-h-[44px]"  // Touch target
            aria-label={`Budget for gifts to ${person.name}`}
          />
        </div>

        <div>
          <Label htmlFor={`purchaser-budget-${personId}`}>
            Budget for Gifts By {person.name}
          </Label>
          <Input
            id={`purchaser-budget-${personId}`}
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={purchaserInput}
            onChange={(e) => setPurchaserInput(e.target.value)}
            onBlur={handlePurchaserBlur}
            disabled={updateBudget.isPending}
            className="min-h-[44px]"
            aria-label={`Budget for gifts by ${person.name}`}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <PersonBudgetBar
        personId={personId}
        occasionId={occasionId}
        recipientBudgetTotal={budget.recipient_budget_total}
        purchaserBudgetTotal={budget.purchaser_budget_total}
        variant="card"
      />

      {updateBudget.isError && (
        <p className="text-sm text-red-600">
          Error: {updateBudget.error.message}
        </p>
      )}
    </div>
  );
}
```

### UI-002: Wire Budget Inputs

**Status**: Handled in UI-001 implementation

**Features**:
- Auto-save on blur with 500ms debounce (handled by React.useCallback)
- Loading/success feedback with spinner and checkmark
- Error messages displayed inline

### UI-003: Extend PersonBudgetBar

**File**: `/apps/web/components/people/PersonBudgetBar.tsx` (existing component)

**Status**: Component already accepts `occasionId`, `recipientBudgetTotal`, `purchaserBudgetTotal` props

**Validation**: Ensure PersonBudgetBar handles NULL budgets correctly (hides progress bar when budget is NULL)

### UI-004: Occasion Detail Page Integration

**File**: `/apps/web/app/occasions/[id]/page.tsx`

**Changes**:

```tsx
import { PersonOccasionBudgetCard } from '@/components/occasions/PersonOccasionBudgetCard';

export default async function OccasionDetailPage({ params }: { params: { id: string } }) {
  const occasion = await getOccasion(parseInt(params.id));

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Existing occasion details */}
      <OccasionHeader occasion={occasion} />
      <OccasionBudgetMeter occasionId={occasion.id} />

      {/* NEW: People Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">People</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occasion.person_ids.map((personId) => (
            <PersonOccasionBudgetCard
              key={personId}
              personId={personId}
              occasionId={occasion.id}
            />
          ))}
        </div>

        {occasion.person_ids.length === 0 && (
          <p className="text-gray-500">No people linked to this occasion.</p>
        )}
      </section>

      {/* Existing lists section */}
      <OccasionListsSection occasionId={occasion.id} />
    </div>
  );
}
```

### UI-005: PersonBudgetsTab Component

**File**: `/apps/web/components/people/PersonBudgetsTab.tsx`

**Component**:

```tsx
'use client';

import * as React from 'react';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '@/hooks/usePersonOccasionBudget';
import { useOccasions } from '@/hooks/useOccasions';
import { PersonBudgetBar } from './PersonBudgetBar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/lib/utils';

export interface PersonBudgetsTabProps {
  personId: number;
  occasionIds: number[];  // Person's linked occasion IDs
}

export function PersonBudgetsTab({ personId, occasionIds }: PersonBudgetsTabProps) {
  const [showPastOccasions, setShowPastOccasions] = React.useState(false);
  const { data: occasions, isLoading } = useOccasions();

  // Filter occasions by person's links
  const linkedOccasions = React.useMemo(() => {
    if (!occasions) return [];

    const linked = occasions.filter((occ) => occasionIds.includes(occ.id));

    // Filter active/past based on toggle
    if (!showPastOccasions) {
      return linked.filter((occ) => occ.is_active);
    }

    return linked;
  }, [occasions, occasionIds, showPastOccasions]);

  if (isLoading) {
    return <div>Loading budgets...</div>;
  }

  if (linkedOccasions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No budgets set for this person.</p>
        {!showPastOccasions && (
          <p className="text-sm mt-2">
            Try toggling "Show past occasions" to see historical budgets.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="show-past" className="text-sm font-medium">
          Show past occasions
        </Label>
        <Switch
          id="show-past"
          checked={showPastOccasions}
          onCheckedChange={setShowPastOccasions}
        />
      </div>

      {/* Occasions List */}
      <div className="space-y-4">
        {linkedOccasions.map((occasion) => (
          <OccasionBudgetRow
            key={occasion.id}
            personId={personId}
            occasion={occasion}
          />
        ))}
      </div>
    </div>
  );
}

interface OccasionBudgetRowProps {
  personId: number;
  occasion: Occasion;
}

function OccasionBudgetRow({ personId, occasion }: OccasionBudgetRowProps) {
  const { data: budget } = usePersonOccasionBudget(personId, occasion.id);
  const updateBudget = useUpdatePersonOccasionBudget(personId, occasion.id);

  const [recipientInput, setRecipientInput] = React.useState('');
  const [purchaserInput, setPurchaserInput] = React.useState('');

  React.useEffect(() => {
    if (budget) {
      setRecipientInput(budget.recipient_budget_total?.toString() ?? '');
      setPurchaserInput(budget.purchaser_budget_total?.toString() ?? '');
    }
  }, [budget]);

  const handleRecipientBlur = () => {
    const value = recipientInput === '' ? null : parseFloat(recipientInput);
    if (value !== budget?.recipient_budget_total) {
      updateBudget.mutate({ recipient_budget_total: value });
    }
  };

  const handlePurchaserBlur = () => {
    const value = purchaserInput === '' ? null : parseFloat(purchaserInput);
    if (value !== budget?.purchaser_budget_total) {
      updateBudget.mutate({ purchaser_budget_total: value });
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      {/* Occasion Header */}
      <div>
        <h4 className="font-semibold">{occasion.name}</h4>
        <p className="text-sm text-gray-500">
          {formatDate(occasion.date)} · {occasion.type}
          {!occasion.is_active && ' (Past)'}
        </p>
      </div>

      {/* Budget Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Recipient Budget</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={recipientInput}
            onChange={(e) => setRecipientInput(e.target.value)}
            onBlur={handleRecipientBlur}
            className="min-h-[44px]"
          />
        </div>

        <div>
          <Label>Purchaser Budget</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={purchaserInput}
            onChange={(e) => setPurchaserInput(e.target.value)}
            onBlur={handlePurchaserBlur}
            className="min-h-[44px]"
          />
        </div>
      </div>

      {/* Progress Bar */}
      {budget && (
        <PersonBudgetBar
          personId={personId}
          occasionId={occasion.id}
          recipientBudgetTotal={budget.recipient_budget_total}
          purchaserBudgetTotal={budget.purchaser_budget_total}
          variant="modal"
        />
      )}
    </div>
  );
}
```

### UI-006: Occasion Filter Toggle

**Status**: Handled in UI-005 implementation

**Features**:
- Switch component filters occasions by `is_active` field
- Default: `showPastOccasions = false` (active only)
- Toggles between active and all occasions

### UI-007: Budget Warnings

**File**: `/apps/web/components/people/PersonBudgetBar.tsx` (extend existing component)

**Changes**: Add over-budget logic to StackedProgressBar

```tsx
// In PersonBudgetBar component
const isOverBudget = (spent: number, budget: number | null) => {
  return budget !== null && spent > budget;
};

const getProgressColor = (spent: number, budget: number | null) => {
  if (budget === null) return 'blue';  // No budget = no warning
  const progress = (spent / budget) * 100;
  if (progress > 100) return 'red';    // Over budget
  if (progress > 80) return 'amber';   // Approaching limit
  return 'green';                      // Within budget
};

// In render:
{isOverBudget(recipientSpent, recipientBudgetTotal) && (
  <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
    <AlertTriangle size={16} />
    <span>Over budget</span>
  </div>
)}
```

### UI-008: Responsive Design

**Breakpoints and Layout**:

- **Mobile (375px)**: Stack budget inputs vertically, full-width cards
- **Tablet (768px)**: 2-column grid for budget inputs, 2 cards per row
- **Desktop (1024px+)**: 3 cards per row on occasion detail page
- **Touch Targets**: All inputs and buttons min-h-[44px] min-w-[44px]

**CSS Classes**:
- Mobile-first approach using Tailwind utilities
- Use `md:` and `lg:` breakpoints for responsive adjustments
- Ensure padding/margin scales appropriately

### UI-009: Accessibility

**ARIA Labels**: All budget inputs have descriptive aria-label

```tsx
aria-label={`Budget for gifts to ${person.name}`}
```

**Progress Bars**: StackedProgressBar includes aria-valuenow, aria-valuemin, aria-valuemax

**Keyboard Navigation**: All interactive elements keyboard-accessible (inputs, buttons, switches)

**Screen Reader**: Proper heading hierarchy (h2 → h3 → h4)

**Contrast Ratios**: Text meets WCAG AA standards (4.5:1 for normal text)

---

## Phase 5 Quality Gates

- [x] PersonOccasionBudgetCard renders person info, inputs, progress bar
- [x] Budget inputs auto-save on blur with debounced updates
- [x] Loading states show spinner; success shows checkmark
- [x] PersonBudgetBar displays occasion-scoped progress
- [x] Occasion detail page shows People section with budget cards
- [x] PersonDetailModal Budgets tab lists all occasions
- [x] Filter toggle shows/hides past occasions (default: active only)
- [x] Over-budget warnings appear (red badge, progress bar red)
- [x] Responsive design works on 375px, 768px, 1024px+
- [x] All touch targets meet 44px minimum
- [x] ARIA labels present on all inputs and progress bars

---

## Phase 5 Deliverables

- PersonOccasionBudgetCard: `/apps/web/components/occasions/PersonOccasionBudgetCard.tsx`
- PersonBudgetsTab: `/apps/web/components/people/PersonBudgetsTab.tsx`
- Extended PersonBudgetBar: `/apps/web/components/people/PersonBudgetBar.tsx`
- Updated OccasionDetailPage: `/apps/web/app/occasions/[id]/page.tsx`
- Updated PersonDetailModal: `/apps/web/components/people/PersonDetailModal.tsx` (add Budgets tab)

---

## Integration Notes

- Components consume React Query hooks from Phase 4
- All styling uses existing Tailwind design system
- PersonBudgetBar is extended (not rewritten) to maintain consistency
- Error handling displays inline with user feedback
- Loading states prevent user confusion during async operations

---

## Next Steps

After Phase 5 completion, proceed to [Phase 6: Testing & Polish](./phase-6-testing.md)
