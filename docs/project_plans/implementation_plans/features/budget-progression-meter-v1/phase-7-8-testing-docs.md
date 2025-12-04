---
title: "Phase 7-8: Testing, Integration & Documentation"
description: "Testing strategy, E2E tests, and comprehensive documentation"
related_plan: "../budget-progression-meter-v1.md"
status: ready
---

# Phase 7-8: Testing, Integration & Documentation

## Phase Overview

| Phase | Duration | Effort | Agents | Dependencies |
|-------|----------|--------|--------|---|
| 7: Testing | 2 days | 2 pts | python-backend-engineer, frontend-developer | All phases |
| 8: Documentation | 1 day | 1 pt | documentation-writer | All phases |

**Total**: 3 story points, 3 days

---

## Phase 7: Testing & Integration

**Duration**: 2 days
**Effort**: 2 story points
**Dependencies**: All previous phases
**Primary Agents**: `python-backend-engineer`, `frontend-developer`

### Epic: BUDGET-TEST - Comprehensive Testing & QA

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-TEST-001 | Backend unit tests | Unit tests for repository and service methods | >80% code coverage, all budget calculations tested, edge cases covered | 0.5 pt | python-backend-engineer |
| BUDGET-TEST-002 | Frontend component tests | Unit tests for React components and hooks | >70% coverage, rendering tested, interaction tested, accessibility | 0.5 pt | frontend-developer |
| BUDGET-TEST-003 | End-to-end tests | Full user workflows from UI to database | E2E: set budget → create gift → verify meter; E2E: multi-user real-time | 0.5 pt | frontend-developer |
| BUDGET-TEST-004 | Mobile & accessibility testing | Test on devices and with accessibility tools | iOS Safari (iPhone 12+), Android Chrome, color contrast, screen readers | 0.5 pt | frontend-developer |

### Files to Create/Modify

**Backend Tests**:
```
services/api/tests/
├── unit/
│   ├── test_budget_repository.py       # Repository unit tests
│   ├── test_budget_service.py          # Service unit tests
│   └── test_budget_calculations.py     # Math-specific tests
├── integration/
│   ├── test_budget_api.py              # API integration tests
│   └── test_budget_workflows.py        # Complete workflows
└── e2e/
    └── test_budget_e2e.py              # End-to-end tests
```

**Frontend Tests**:
```
apps/web/__tests__/
├── components/
│   ├── BudgetMeterComponent.test.tsx
│   ├── BudgetTooltip.test.tsx
│   └── BudgetWarningCard.test.tsx
├── hooks/
│   └── useBudgetMeter.test.ts
└── integration/
    ├── budget-form-integration.test.tsx
    └── budget-e2e.test.tsx
```

### Detailed Task Descriptions

#### BUDGET-TEST-001: Backend unit tests

**Instructions for python-backend-engineer**:

1. Create comprehensive unit tests for BudgetRepository:
   - All calculation methods (purchased, planned, remaining)
   - Edge cases: null prices, zero budget, no gifts
   - Large datasets (100+ items)
   - Sub-budget queries

2. Create comprehensive unit tests for BudgetService:
   - calculate_meter_data with various inputs
   - validate_budget_warning with all severity levels
   - get_sub_budget_context with and without data

3. Test file: `services/api/tests/unit/test_budget_calculations.py`

```python
import pytest
from decimal import Decimal
from app.repositories.budget import BudgetRepository
from app.services.budget import BudgetService

class TestBudgetCalculations:
    """Test all budget calculation scenarios"""

    def test_zero_budget_scenario(self, db_session):
        """Should handle zero budget gracefully"""
        occasion = Occasion(budget_total=Decimal("0.00"))
        db_session.add(occasion)
        db_session.commit()

        repo = BudgetRepository(db_session)
        meter = BudgetService(repo).calculate_meter_data(occasion.id)

        assert meter.total_budget == Decimal("0.00")
        assert meter.percentage_used == 0  # 0/0 edge case

    def test_all_items_null_prices(self, db_session):
        """Should handle all null prices"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        gift1 = ListItem(occasion_id=occasion.id, status='planned', planned_price=None)
        gift2 = ListItem(occasion_id=occasion.id, status='planned', planned_price=None)
        db_session.add_all([occasion, gift1, gift2])
        db_session.commit()

        repo = BudgetRepository(db_session)
        total = repo.get_planned_total(occasion.id)

        assert total == Decimal("0.00")

    def test_mixed_null_and_prices(self, db_session):
        """Should sum only non-null prices"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        gift1 = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("100.00"))
        gift2 = ListItem(occasion_id=occasion.id, status='planned', planned_price=None)
        gift3 = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("50.00"))
        db_session.add_all([occasion, gift1, gift2, gift3])
        db_session.commit()

        repo = BudgetRepository(db_session)
        total = repo.get_planned_total(occasion.id)

        assert total == Decimal("150.00")

    def test_large_dataset_performance(self, db_session):
        """Should calculate quickly even with 100+ items"""
        import time

        occasion = Occasion(budget_total=Decimal("5000.00"))
        db_session.add(occasion)
        db_session.commit()

        # Create 100+ gifts
        gifts = [
            ListItem(
                occasion_id=occasion.id,
                status='planned',
                planned_price=Decimal(f"{i}.00")
            )
            for i in range(100)
        ]
        db_session.add_all(gifts)
        db_session.commit()

        repo = BudgetRepository(db_session)
        start = time.time()
        total = repo.get_planned_total(occasion.id)
        elapsed = time.time() - start

        assert total == Decimal("4950.00")  # 0+1+2+...+99
        assert elapsed < 0.05  # <50ms

    def test_warning_approaching_threshold(self, db_session):
        """Should warn when approaching 80% budget"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        gift = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("400.00"))
        db_session.add_all([occasion, gift])
        db_session.commit()

        service = BudgetService(BudgetRepository(db_session))
        warning = service.validate_budget_warning(Decimal("50.00"), occasion.id)

        # 400 + 50 = 450, which is 90% of 500
        assert warning.has_warning is True
        assert warning.severity in ['approaching', 'exceeding']

    def test_warning_exceeding(self, db_session):
        """Should warn when exceeding budget"""
        occasion = Occasion(budget_total=Decimal("500.00"))
        gift = ListItem(occasion_id=occasion.id, status='planned', planned_price=Decimal("400.00"))
        db_session.add_all([occasion, gift])
        db_session.commit()

        service = BudgetService(BudgetRepository(db_session))
        warning = service.validate_budget_warning(Decimal("150.00"), occasion.id)

        # 400 + 150 = 550, which exceeds 500
        assert warning.has_warning is True
        assert warning.severity == 'exceeding'
        assert 'exceed' in warning.message.lower()

    def test_sub_budget_context(self, db_session):
        """Should calculate sub-budget context"""
        occasion = Occasion()
        person = Person(name="Alice")
        sub_budget = EntityBudget(
            entity_type='person',
            entity_id=person.id,
            occasion_id=occasion.id,
            budget_amount=Decimal("200.00")
        )
        gift = ListItem(
            occasion_id=occasion.id,
            recipient_id=person.id,
            planned_price=Decimal("80.00")
        )
        db_session.add_all([occasion, person, sub_budget, gift])
        db_session.commit()

        service = BudgetService(BudgetRepository(db_session))
        context = service.get_sub_budget_context(person.id, occasion.id)

        assert context is not None
        assert context.budget_amount == Decimal("200.00")
        assert context.spent == Decimal("80.00")
        assert context.remaining == Decimal("120.00")
        assert context.percentage_used == 40.0
```

4. Coverage target: >80%
5. Run: `pytest services/api/tests/unit/test_budget_*.py -v --cov`

---

#### BUDGET-TEST-002: Frontend component tests

**Instructions for frontend-developer**:

1. Create component unit tests using React Testing Library:

```typescript
// apps/web/__tests__/components/BudgetMeterComponent.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetMeterComponent } from '@/components/budget/BudgetMeterComponent';

describe('BudgetMeterComponent', () => {
  const mockBudgetData = {
    total_budget: 500,
    purchased: 200,
    planned: 100,
    remaining: 200,
    percentage_used: 60,
    currency: 'USD',
  };

  it('should render all three segments', () => {
    render(<BudgetMeterComponent budgetData={mockBudgetData} />);

    expect(screen.getByText(/Purchased/)).toBeInTheDocument();
    expect(screen.getByText(/Planned/)).toBeInTheDocument();
    expect(screen.getByText(/Remaining/)).toBeInTheDocument();
  });

  it('should display correct dollar amounts', () => {
    render(<BudgetMeterComponent budgetData={mockBudgetData} />);

    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
  });

  it('should display percentage used', () => {
    render(<BudgetMeterComponent budgetData={mockBudgetData} />);

    expect(screen.getByText(/60% used/)).toBeInTheDocument();
  });

  it('should handle no budget gracefully', () => {
    const noBudgetData = {
      ...mockBudgetData,
      total_budget: null,
      remaining: null,
      percentage_used: null,
    };

    render(<BudgetMeterComponent budgetData={noBudgetData} />);

    expect(screen.getByText(/No budget set/)).toBeInTheDocument();
  });

  it('should call onSegmentClick when segment clicked', async () => {
    const user = userEvent.setup();
    const onSegmentClick = jest.fn();

    render(
      <BudgetMeterComponent
        budgetData={mockBudgetData}
        onSegmentClick={onSegmentClick}
      />
    );

    const purchasedButton = screen.getByTitle('Purchased: $200.00');
    await user.click(purchasedButton);

    expect(onSegmentClick).toHaveBeenCalledWith('purchased');
  });

  it('should be responsive to viewport width', () => {
    const { container } = render(
      <BudgetMeterComponent budgetData={mockBudgetData} />
    );

    const meter = container.querySelector('[class*="w-full"]');
    expect(meter).toBeInTheDocument();
  });

  it('should have accessible touch targets', () => {
    const { container } = render(
      <BudgetMeterComponent budgetData={mockBudgetData} />
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const height = button.clientHeight;
      expect(height).toBeGreaterThanOrEqual(44); // 44px minimum
    });
  });
});
```

2. Test useBudgetMeter hook:

```typescript
// apps/web/__tests__/hooks/useBudgetMeter.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBudgetMeter } from '@/hooks/useBudgetMeter';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useBudgetMeter', () => {
  it('should fetch budget data', async () => {
    const { result } = renderHook(
      () => useBudgetMeter(1),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it('should invalidate cache on WebSocket event', async () => {
    // Mock WebSocket subscription
    const { result, rerender } = renderHook(
      () => useBudgetMeter(1),
      { wrapper: createWrapper() }
    );

    // Simulate WebSocket event
    // ... trigger invalidation

    await waitFor(() => {
      expect(result.current.isRefetching).toBe(false);
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    const { result } = renderHook(
      () => useBudgetMeter(99999),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

3. Coverage target: >70%
4. Run: `npm run test -- --coverage apps/web/__tests__`

---

#### BUDGET-TEST-003: End-to-end tests

**Instructions for frontend-developer**:

1. Create E2E test workflows:

```typescript
// apps/web/__tests__/integration/budget-e2e.test.tsx
import { test, expect } from '@playwright/test';

test.describe('Budget Progression Meter E2E', () => {
  test('should update meter when gift created', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');

    // 2. Navigate to occasion with budget
    await page.click('[data-testid="occasion-christmas"]');
    await page.waitForURL(/\/occasions\/\d+/);

    // 3. Verify meter displays
    const meter = page.locator('[data-testid="budget-meter"]');
    await expect(meter).toBeVisible();
    const initialRemaining = await page.locator('[data-testid="remaining-amount"]').textContent();

    // 4. Open gift form
    await page.click('[data-testid="add-gift-button"]');

    // 5. Add gift with price
    await page.fill('[data-testid="gift-name"]', 'Test Gift');
    await page.fill('[data-testid="gift-price"]', '100');
    await page.click('[data-testid="submit-gift"]');

    // 6. Wait for meter update
    await page.waitForFunction(
      () => {
        const remaining = page.locator('[data-testid="remaining-amount"]').textContent();
        return remaining !== initialRemaining;
      },
      { timeout: 5000 }
    );

    // 7. Verify meter updated correctly
    const newRemaining = await page.locator('[data-testid="remaining-amount"]').textContent();
    expect(newRemaining).not.toBe(initialRemaining);
  });

  test('should show warning when exceeding budget', async ({ page }) => {
    // 1-3. Setup (login, navigate)
    // ... (similar to above)

    // 4. Open gift form
    await page.click('[data-testid="add-gift-button"]');

    // 5. Enter price that exceeds budget
    const remaining = parseInt(
      await page.locator('[data-testid="remaining-amount"]').textContent()
    );
    await page.fill('[data-testid="gift-price"]', String(remaining + 50));

    // 6. Verify warning appears
    const warning = page.locator('[data-testid="budget-warning"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('exceed');
  });

  test('should display multi-user real-time updates', async ({ browser }) => {
    // 1. User 1 opens occasion detail
    const context1 = await browser.newContext();
    const page1 = context1.newPage();
    // ... login and navigate to occasion

    // 2. User 2 opens same occasion detail
    const context2 = await browser.newContext();
    const page2 = context2.newPage();
    // ... login and navigate to same occasion

    // 3. User 1 adds gift
    await page1.fill('[data-testid="gift-price"]', '100');
    await page1.click('[data-testid="submit-gift"]');

    // 4. Verify User 2 sees update within 500ms
    const startTime = Date.now();
    await page2.waitForFunction(
      () => {
        const remaining = page2.locator('[data-testid="remaining-amount"]').textContent();
        return parseInt(remaining) === expectedRemaining;
      },
      { timeout: 500 }
    );
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(500);
  });

  test('should work on mobile (iPhone 12)', async ({ browserName }) => {
    if (browserName !== 'webkit') this.skip(); // iOS only test

    test.use({
      viewport: { width: 390, height: 844 }, // iPhone 12
      isMobile: true,
    });

    // ... run above tests with mobile viewport
    // Verify touch targets are ≥44px
    // Verify layout responsive
  });

  test('should work on Android', async ({ browserName }) => {
    if (browserName !== 'chromium') this.skip();

    test.use({
      viewport: { width: 412, height: 915 }, // Pixel 5
      isMobile: true,
    });

    // ... run above tests with Android viewport
  });
});
```

2. Run: `npx playwright test apps/web/__tests__/integration/budget-e2e.test.tsx`
3. Verify all workflows pass

---

#### BUDGET-TEST-004: Mobile & accessibility testing

**Instructions for frontend-developer**:

1. **Mobile Testing Checklist**:

| Platform | Browser | Test Scenarios | Status |
|----------|---------|---|---|
| iOS (iPhone 12) | Safari | Load occasion detail, create gift, verify meter | [ ] |
| iOS (iPhone 14) | Safari | Same as iPhone 12 | [ ] |
| Android | Chrome | Same as iOS | [ ] |
| Tablet | Safari/Chrome | Responsive layout, meter sizing | [ ] |

```typescript
// Manual mobile testing checklist
- [ ] Budget meter renders without overflow on 375px width
- [ ] All buttons/segments have 44px+ touch targets
- [ ] Tooltips are readable on small screens
- [ ] Gift form sidebar stacks properly on mobile
- [ ] No horizontal scroll required
- [ ] Dark mode (if supported) works correctly
```

2. **Accessibility Testing**:

```bash
# Using axe-core for automated accessibility checks
npm install --save-dev @axe-core/react

# Example test
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

test('BudgetMeterComponent has no accessibility violations', async () => {
  const { container } = render(
    <BudgetMeterComponent budgetData={mockData} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

3. **Color Contrast Check**:
   - Green segment: #22C55E (luminance high enough)
   - Blue segment: #3B82F6
   - Gray segment: #D1D5DB
   - All must meet WCAG AA (4.5:1 for text)

4. **Screen Reader Test**:
   - Use NVDA (Windows), JAWS (Windows), or VoiceOver (macOS/iOS)
   - Verify: Segment labels announced, percentages read correctly, buttons focusable

---

### Testing Coverage Goals

| Area | Target | Method |
|------|--------|--------|
| Backend Unit | >80% | pytest --cov |
| Frontend Unit | >70% | jest --coverage |
| Integration | >70% | pytest + React Testing Library |
| E2E Critical Flows | 3+ scenarios | Playwright |
| Mobile Platforms | iOS + Android | Manual + Playwright |
| Accessibility | WCAG AA | axe-core + manual screen reader |

---

## Phase 8: Documentation

**Duration**: 1 day
**Effort**: 1 story point
**Dependencies**: All phases complete
**Primary Agent**: `documentation-writer`

### Epic: BUDGET-DOCS - Comprehensive Documentation

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-DOCS-001 | API documentation | Document all endpoints with examples | /api/budgets/meter/{id}, PATCH occasions/{id}/budget, POST budgets/sub-budget; request/response schemas | 0.25 pt | documentation-writer |
| BUDGET-DOCS-002 | Component documentation | Document components, props, and Storybook stories | BudgetMeter, Tooltip, WarningCard props; usage examples; dark mode | 0.25 pt | documentation-writer |
| BUDGET-DOCS-003 | User guide | "How to set and track budgets" guide | Screenshots, step-by-step, examples, FAQ | 0.25 pt | documentation-writer |
| BUDGET-DOCS-004 | ADR & architecture guide | Architecture decisions, trade-offs, implementation notes | Budget calculation strategy ADR, WebSocket pattern, sub-budget design | 0.25 pt | documentation-writer |

### Files to Create

**Documentation**:
```
docs/
├── api/
│   ├── budgets.md                       # API endpoint documentation
│   └── schemas/budget-meter.md          # DTO schema docs
├── components/
│   ├── BudgetMeter.md                   # Component documentation
│   └── examples/                        # Usage examples
├── guides/
│   └── budget-tracking.md               # User guide
└── architecture/
    └── adr-budget-strategy.md           # Architecture decision record
```

### Detailed Task Descriptions

#### BUDGET-DOCS-001: API documentation

**Instructions for documentation-writer**:

Create file: `docs/api/budgets.md`

```markdown
# Budget API Endpoints

## GET /api/budgets/meter/{occasion_id}

Retrieves complete budget meter data for an occasion.

### Request

```
GET /api/budgets/meter/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response (200 OK)

```json
{
  "occasion_id": 1,
  "total_budget": 500.00,
  "purchased": 200.00,
  "planned": 100.00,
  "remaining": 200.00,
  "percentage_used": 60.0,
  "currency": "USD"
}
```

### Fields

- **occasion_id** (int): ID of the occasion
- **total_budget** (decimal | null): Total budget for occasion, or null if not set
- **purchased** (decimal): Sum of prices for gifted items (status = 'gifted' or 'delivered')
- **planned** (decimal): Sum of prices for non-gifted items with prices
- **remaining** (decimal | null): total_budget - purchased - planned (null if no budget)
- **percentage_used** (float | null): (purchased + planned) / total_budget * 100

### Error Responses

**404 Not Found**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Occasion not found or access denied",
    "trace_id": "abc123def456"
  }
}
```

---

## PATCH /api/occasions/{occasion_id}/budget

Set or update the total budget for an occasion.

### Request

```
PATCH /api/occasions/1/budget
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "budget_total": 750.00
}
```

### Request Fields

- **budget_total** (decimal | null): New budget amount, or null to remove budget

### Response (200 OK)

```json
{
  "id": 1,
  "name": "Christmas 2025",
  "date": "2025-12-25",
  "budget_total": 750.00,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-12-04T15:30:00Z"
}
```

### Error Responses

**404 Not Found**: Occasion not found
**422 Unprocessable Entity**: Invalid budget (negative or non-numeric)

---

## POST /api/budgets/sub-budget

Create or update a sub-budget for an entity (person, category, etc.) within an occasion.

### Request

```
POST /api/budgets/sub-budget
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "entity_type": "person",
  "entity_id": 5,
  "occasion_id": 1,
  "budget_amount": 200.00
}
```

### Request Fields

- **entity_type** (string): Type of entity ('person', 'category', etc.)
- **entity_id** (int): ID of the entity (e.g., person ID)
- **occasion_id** (int): Occasion this sub-budget belongs to
- **budget_amount** (decimal): Sub-budget amount

### Response (200 OK)

```json
{
  "entity_type": "person",
  "entity_id": 5,
  "occasion_id": 1,
  "budget_amount": 200.00,
  "spent": 80.00,
  "remaining": 120.00,
  "percentage_used": 40.0
}
```

### Error Responses

**404 Not Found**: Occasion or entity not found
**422 Unprocessable Entity**: Invalid input

---

## GET /api/budgets/sub-budget/{entity_type}/{entity_id}/{occasion_id}

Retrieve sub-budget context for a specific entity.

### Response (200 OK)

Same as POST response above.

### Response (204 No Content)

If sub-budget not set for this entity.
```

---

#### BUDGET-DOCS-002: Component documentation

**Instructions for documentation-writer**:

Create file: `docs/components/BudgetMeter.md`

```markdown
# BudgetMeterComponent

A horizontal segmented progress bar visualizing budget allocation with three categories: purchased, planned, and remaining.

## Props

```typescript
interface BudgetMeterProps {
  budgetData: {
    total_budget: number | null;
    purchased: number;
    planned: number;
    remaining: number | null;
    percentage_used: number | null;
    currency: string;
  };
  onSegmentClick?: (segment: 'purchased' | 'planned' | 'remaining') => void;
  showTooltip?: boolean;
  isLoading?: boolean;
}
```

### Props Details

- **budgetData** (required): Budget meter data object
  - **total_budget**: Total occasion budget (null if not set)
  - **purchased**: Sum of actual prices for completed gifts
  - **planned**: Sum of estimated prices for unfinished gifts
  - **remaining**: Budget remaining after purchased + planned
  - **percentage_used**: Percentage of budget allocated (purchased + planned)
  - **currency**: Currency code (default: 'USD')

- **onSegmentClick** (optional): Callback when user clicks a segment
  - Called with 'purchased', 'planned', or 'remaining'
  - Use to navigate to filtered view or details

- **showTooltip** (optional, default: true): Whether to show gift list tooltip

- **isLoading** (optional, default: false): Show loading skeleton

## Usage

### Basic

```tsx
import { useBudgetMeter } from '@/hooks/useBudgetMeter';
import { BudgetMeterComponent } from '@/components/budget/BudgetMeterComponent';

export const OccasionDetail = ({ occasionId }) => {
  const { data: budgetData, isLoading } = useBudgetMeter(occasionId);

  return (
    <BudgetMeterComponent
      budgetData={budgetData}
      isLoading={isLoading}
    />
  );
};
```

### With Click Handler

```tsx
<BudgetMeterComponent
  budgetData={budgetData}
  onSegmentClick={(segment) => {
    navigate(`/occasions/${occasionId}?filter=${segment}`);
  }}
/>
```

## Accessibility

- Color-coded segments: Green (purchased), Blue (planned), Gray (remaining)
- Dollar amounts displayed next to each segment
- Touch targets ≥44px on mobile
- ARIA labels for screen readers
- Semantic HTML with proper heading hierarchy

## Mobile Responsive

- Full width on mobile (<768px)
- Segments scale proportionally
- Labels stack on very small screens (if needed)
- Works on iOS Safari and Android Chrome

## Storybook

See `BudgetMeterComponent.stories.tsx` for interactive examples:

```
storybook: Complete budget, Near limit, No budget, Loading state
```
```

---

#### BUDGET-DOCS-003: User guide

**Instructions for documentation-writer**:

Create file: `docs/guides/budget-tracking.md`

```markdown
# Budget Tracking Guide

Learn how to set budgets, track spending, and prevent overspending using the Budget Progression Meter.

## Getting Started

### 1. Set a Budget on an Occasion

1. Navigate to an Occasion (e.g., Christmas)
2. Look for the "Budget" section or edit button
3. Enter total budget amount (e.g., $500)
4. Save

The budget meter will appear on the occasion detail page.

### 2. Understanding the Budget Meter

The meter shows three colored segments:

- **Green**: Gifts you've already purchased/gifted
- **Blue**: Gifts you've planned but not yet purchased
- **Gray**: Remaining budget

Below each segment, you'll see the dollar amount and percentage of budget used.

Example:
```
[====GREEN====|===BLUE===|=====GRAY=====]
Purchased: $200 / Planned: $100 / Remaining: $200 / Total: $500
Used: 60%
```

### 3. Create Gifts with Budget Awareness

When creating a gift for an occasion with a budget:

1. Open the gift creation form
2. Enter gift details (name, recipient, etc.)
3. In the **Budget Info** sidebar, you'll see:
   - Total occasion budget
   - Currently spent
   - Remaining budget
   - Projected remaining after this gift
4. If your gift price would exceed budget, a **warning** appears (red highlight)
5. You can still add the gift (warnings are not blocks)

### 4. Set Sub-Budgets (Optional)

If you want to allocate budget per person:

1. From occasion detail, click "Set Sub-Budgets"
2. For each recipient, enter their allocated budget
3. When creating gifts, the form shows remaining sub-budget for that recipient

Example:
```
Occasion Total: $500
  - Mom: $150 budget
  - Dad: $150 budget
  - Siblings: $200 budget
```

### 5. View Dashboard Budget Summary

The dashboard shows the next upcoming occasion's budget meter, giving you a quick status check.

Click the meter to navigate to full occasion details.

## FAQ

**Q: Can I prevent overspending?**
A: No, warnings appear but don't block. This gives you flexibility for gifts you really want to add.

**Q: What if I don't set a budget?**
A: The budget meter won't display. You can still create and manage gifts.

**Q: How often does the meter update?**
A: Real-time! When you or a family member adds/updates a gift, the meter refreshes within 500ms.

**Q: What counts as "purchased" vs "planned"?**
A: Purchased = gifts marked as 'gifted' or 'delivered'
  Planned = all other statuses with a price

**Q: Can multiple family members see and update the same budget?**
A: Yes! All family members see the same budget and it updates in real-time.
```

---

#### BUDGET-DOCS-004: ADR & Architecture

**Instructions for documentation-writer**:

Create file: `docs/architecture/adr-budget-strategy.md`

```markdown
# ADR: Budget Calculation Strategy - Computed vs. Stored

## Status

ACCEPTED

## Context

The Budget Progression Meter feature needs to calculate and display three values:
1. Purchased total (sum of prices for completed gifts)
2. Planned total (sum of prices for unfinished gifts)
3. Remaining budget (total - purchased - planned)

## Problem

Two approaches were considered:

### Option A: Stored Approach
- Create a `budget_transactions` table to log every purchase
- When budget changes, update transaction records
- Query transactions table for totals

**Pros**:
- Audit trail of what was purchased when
- Easier to implement reconciliation logic
- Can track price changes over time

**Cons**:
- More complex schema and migrations
- More mutation points (gift creation AND transaction logging)
- Risk of transaction log getting out of sync
- More storage overhead

### Option B: Computed Approach (CHOSEN)
- Calculate totals in real-time from gift prices
- No separate budget transaction table
- Source of truth: ListItem prices

**Pros**:
- Simpler schema (only need budget_total on occasions)
- Single source of truth (gift prices)
- Fewer mutation points (only gift CRUD)
- Always accurate by definition
- Smaller codebase and fewer potential bugs

**Cons**:
- Requires running aggregation queries
- No audit trail of budget changes
- Performance depends on query efficiency

## Decision

**CHOSEN: Computed Approach (Option B)**

## Rationale

For a small-family app (2-3 users) with moderate gift counts (10-100 per occasion), computed budgets are:
1. Simpler to understand and maintain
2. Always accurate (no sync issues)
3. Fewer mutation points = fewer places for bugs
4. Query performance is acceptable for the use case

The audit trail and reconciliation features can be added in future versions if needed.

## Implementation

### Query Pattern

```python
def get_purchased_total(occasion_id):
    return db.query(
        func.sum(func.coalesce(ListItem.actual_price, 0))
    ).filter(
        ListItem.occasion_id == occasion_id,
        ListItem.status.in_(['gifted', 'delivered'])
    ).scalar() or Decimal(0)
```

### Caching

- Results cached in React Query with 5-minute staleTime
- Cache invalidated on gift mutations via WebSocket
- Re-fetched on window focus (ensures freshness)

### Performance Targets

- Query execution: <50ms (even with 100+ items)
- Component render: <100ms
- Cache hit (no query): instant

## Alternatives Rejected

- **Option A (Stored)**: Too complex for current use case
- **Option C (Hybrid)**: Over-engineered; adds complexity without benefit

## Consequences

- Budget calculations always accurate ✓
- Simpler schema ✓
- Fewer database round-trips ✓
- No audit trail (acceptable for v1) ✗
- Depends on query performance (mitigated by staleTime caching) ~

## Follow-up

If in future we need:
- Audit trail of budget changes
- Reconciliation of estimated vs. actual prices
- Multi-currency handling

Consider creating a separate `budget_audit_log` or `budget_snapshots` table that's populated asynchronously from gift mutations.
```

---

### Quality Gates for Phase 8

- [ ] All endpoints documented with examples
- [ ] Component props documented
- [ ] User guide covers main workflows
- [ ] ADR explains key architecture decisions
- [ ] Examples are copy-paste ready
- [ ] Documentation builds without errors
- [ ] All links are valid (internal and external)

---

## Integration Testing Summary

### Test Scenarios Covered

| Scenario | Test Type | Status |
|----------|-----------|--------|
| Set occasion budget → verify persisted | Integration | ✓ |
| Create gift → verify meter updates | E2E | ✓ |
| Set sub-budget → create gift → verify context | E2E | ✓ |
| Multi-user real-time updates | E2E | ✓ |
| Budget warning on overspend | Component | ✓ |
| Mobile layout responsive | Mobile | ✓ |
| Null price handling | Unit | ✓ |
| Zero budget scenario | Unit | ✓ |
| Large dataset (100+ items) | Performance | ✓ |
| Accessibility (color contrast, ARIA) | A11y | ✓ |

---

## Deployment Verification Checklist

**Before Release**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage >75% (backend >80%, frontend >70%)
- [ ] Performance benchmarks met (<50ms calculations, <100ms renders)
- [ ] Mobile testing complete (iOS & Android)
- [ ] Accessibility testing complete (WCAG AA)
- [ ] Documentation complete and reviewed
- [ ] Feature flags configured and tested
- [ ] Staging environment verified

**After Release**:
- [ ] Monitor API error rates
- [ ] Monitor WebSocket disconnections
- [ ] Monitor meter query latency
- [ ] Collect user feedback (adoption, usability)
- [ ] Track feature flag metrics

---

**End of Phase 7-8 Detailed Plan**

**Total Lines**: 600+
**Implementation Ready**: All phases complete and ready for team execution

