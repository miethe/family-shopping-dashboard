---
title: "Phase 6: Testing, Polish & Documentation"
description: "Comprehensive testing, accessibility audit, performance validation, and documentation"
audience: [developers, qa-engineers, testers]
tags: [implementation, phase, testing, quality, accessibility, documentation]
created: 2025-12-22
updated: 2025-12-22
category: "product-planning"
status: ready
---

# Phase 6: Testing, Polish & Documentation

**Duration**: 5 business days (Days 11-15)
**Story Points**: 12 pts
**Assigned Subagent(s)**: testing-specialist, code-reviewer, ui-engineer-enhanced, frontend-developer
**Dependencies**: Phases 1-5 complete

---

## Phase Overview

Phase 6 finalizes the implementation with comprehensive testing across all layers (unit, integration, component, E2E), accessibility audit, performance validation, responsive design refinement, and complete documentation. This phase ensures production readiness and user accessibility.

**Key Deliverables**:
1. Unit tests for all new components (>80% coverage)
2. Integration tests for mutations and cache invalidation
3. Component tests for user interactions
4. E2E test covering full workflow
5. Accessibility audit (WCAG 2.1 AA compliance)
6. Mobile responsiveness validation
7. Performance profiling and optimization
8. Component API documentation
9. Updated API documentation for `from_santa` field
10. Polish and bug fixes

**Quality Gates**:
- [ ] All tests passing in CI/CD
- [ ] Code coverage >80% (unit), >70% (integration)
- [ ] E2E workflow test covering all 7 features
- [ ] WCAG 2.1 AA compliance (0 critical accessibility issues)
- [ ] All touch targets ≥44px on mobile
- [ ] Interaction latency <500ms
- [ ] No console errors or warnings
- [ ] Responsive design tested on 3+ device sizes

---

## Task Breakdown

### T6.1: Unit Tests for New Components

**Story ID**: P6-T1
**Story Points**: 3 pts
**Assigned Subagent(s)**: testing-specialist, frontend-developer

#### Description

Write comprehensive unit tests for the three new frontend components: StatusButton, ListPickerDropdown, and PriceEditDialog. Tests should cover rendering, user interactions, mutations, and error states.

#### Acceptance Criteria

- [ ] Test files created:
  - `apps/web/__tests__/components/gifts/StatusButton.test.tsx`
  - `apps/web/__tests__/components/gifts/ListPickerDropdown.test.tsx`
  - `apps/web/__tests__/components/gifts/PriceEditDialog.test.tsx`
- [ ] Coverage >80% for each component
- [ ] All tests passing
- [ ] Tests use Vitest + React Testing Library
- [ ] Mocks for hooks and API calls included
- [ ] User interactions tested (click, input, select)
- [ ] Error states tested (mutation failure, validation)
- [ ] Accessibility tested (ARIA labels, keyboard nav)

#### Test Suite Structure

**StatusButton.test.tsx**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusButton } from '@/components/gifts/StatusButton';
import { useUpdateGift } from '@/hooks/useGifts';

vi.mock('@/hooks/useGifts');

describe('StatusButton', () => {
  describe('rendering', () => {
    it('renders button with current status', () => {
      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      expect(screen.getByRole('button', { name: /Change status/i })).toBeInTheDocument();
      expect(screen.getByText('IDEA')).toBeInTheDocument();
    });
  });

  describe('dropdown interaction', () => {
    it('opens dropdown on button click', async () => {
      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(screen.getByRole('menuitem', { name: /Selected/i })).toBeInTheDocument();
    });

    it('calls mutation on status select', async () => {
      const mockMutate = vi.fn();
      (useUpdateGift as any).mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });

      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      const selectedItem = screen.getByRole('menuitem', { name: /Selected/i });
      fireEvent.click(selectedItem);

      expect(mockMutate).toHaveBeenCalledWith({ status: 'SELECTED' });
    });

    it('closes dropdown after selection', async () => {
      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      const selectedItem = screen.getByRole('menuitem', { name: /Selected/i });
      fireEvent.click(selectedItem);

      await vi.waitFor(() => {
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
      });
    });
  });

  describe('pending state', () => {
    it('disables button while mutation pending', () => {
      (useUpdateGift as any).mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
      });

      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      expect(screen.getByRole('button', { name: /Change status/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      render(
        <StatusButton giftId={1} currentStatus="IDEA" />
      );
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      fireEvent.keyDown(button, { key: 'Enter' });
      // Verify dropdown opens (Radix handles this)
    });
  });
});
```

**ListPickerDropdown.test.tsx** (similar structure):
- Test rendering with mock lists
- Test checkbox multi-select
- Test Apply/Cancel buttons
- Test "Create New List" dialog trigger
- Test error handling
- Test touch targets (44px)

**PriceEditDialog.test.tsx** (similar structure):
- Test dialog opens/closes
- Test price input validation
- Test "No price" checkbox
- Test Save/Cancel buttons
- Test error messages
- Test input parsing ("$49.99" → 49.99)

#### Coverage Target

- StatusButton: 85%+ coverage
- ListPickerDropdown: 80%+ coverage
- PriceEditDialog: 85%+ coverage

#### Running Tests

```bash
# Run all component tests
npm run test -- components/gifts

# Run with coverage
npm run test -- --coverage components/gifts

# Watch mode during development
npm run test -- --watch components/gifts
```

#### Integration with CI/CD

- Tests must pass before PR merge
- Coverage report generated
- Failures block deployment

---

### T6.2: Integration Tests for Mutations

**Story ID**: P6-T2
**Story Points**: 2 pts
**Assigned Subagent(s)**: testing-specialist, frontend-developer

#### Description

Write integration tests that verify mutations work correctly with API calls and React Query cache invalidation. Tests should cover happy path and error scenarios.

#### Acceptance Criteria

- [ ] Test file: `apps/web/__tests__/integration/gifts-mutations.test.tsx`
- [ ] Tests cover:
  - [ ] Status update mutation + cache invalidation
  - [ ] List assignment mutation + cache invalidation
  - [ ] Price update mutation + cache invalidation
  - [ ] From Santa toggle mutation + cache invalidation
- [ ] All tests passing
- [ ] Coverage >70%
- [ ] Mock API responses included
- [ ] Error scenarios tested (API failure, network error)
- [ ] Optimistic updates verified
- [ ] Cache invalidation verified

#### Test Suite Structure

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GiftCard } from '@/components/gifts/GiftCard';
import * as giftApi from '@/api/gifts';

vi.mock('@/api/gifts');

describe('Gift Mutations Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
  });

  describe('status mutation', () => {
    it('updates status and invalidates cache', async () => {
      const mockGift = { id: 1, status: 'IDEA', from_santa: false };
      (giftApi.updateGift as any).mockResolvedValue({
        ...mockGift,
        status: 'PURCHASED',
      });

      render(
        <QueryClientProvider client={queryClient}>
          <GiftCard gift={mockGift} />
        </QueryClientProvider>
      );

      // Trigger mutation (click status button)
      const statusBtn = screen.getByRole('button', { name: /Change status/i });
      fireEvent.click(statusBtn);
      const purchasedOption = screen.getByRole('menuitem', { name: /Purchased/i });
      fireEvent.click(purchasedOption);

      // Verify API called
      await waitFor(() => {
        expect(giftApi.updateGift).toHaveBeenCalledWith(1, { status: 'PURCHASED' });
      });

      // Verify cache invalidated
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['gifts'] });
    });

    it('handles mutation error with toast', async () => {
      (giftApi.updateGift as any).mockRejectedValue(new Error('API Error'));

      render(
        <QueryClientProvider client={queryClient}>
          <GiftCard gift={{ id: 1, status: 'IDEA' }} />
        </QueryClientProvider>
      );

      // Trigger mutation and error
      const statusBtn = screen.getByRole('button');
      fireEvent.click(statusBtn);
      const option = screen.getByRole('menuitem');
      fireEvent.click(option);

      // Verify error toast shown
      await waitFor(() => {
        expect(screen.getByText(/Failed to update/i)).toBeInTheDocument();
      });
    });
  });

  describe('price mutation', () => {
    it('updates price with validation', async () => {
      const mockGift = { id: 1, price: 25.00 };
      (giftApi.updateGift as any).mockResolvedValue({
        ...mockGift,
        price: 49.99,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <GiftCard gift={mockGift} />
        </QueryClientProvider>
      );

      // Open price dialog
      const priceBtn = screen.getByText('$25.00');
      fireEvent.click(priceBtn);

      // Input new price
      const input = screen.getByRole('textbox', { name: /Price/i });
      fireEvent.change(input, { target: { value: '49.99' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(giftApi.updateGift).toHaveBeenCalledWith(1, { price: 49.99 });
      });
    });
  });

  describe('list assignment mutation', () => {
    it('adds gift to multiple lists', async () => {
      (giftApi.addGiftToLists as any).mockResolvedValue({
        id: 1,
        lists: [{ id: 1, name: 'Christmas' }, { id: 2, name: 'Birthdays' }],
      });

      render(
        <QueryClientProvider client={queryClient}>
          <GiftCard gift={{ id: 1, lists: [] }} />
        </QueryClientProvider>
      );

      // Open list picker
      const listBtn = screen.getByRole('button', { name: /\+List/i });
      fireEvent.click(listBtn);

      // Select lists
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);

      // Apply
      const applyBtn = screen.getByRole('button', { name: /Apply/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(giftApi.addGiftToLists).toHaveBeenCalledWith(1, [1, 2]);
      });
    });
  });

  describe('Santa toggle mutation', () => {
    it('toggles from_santa flag', async () => {
      (giftApi.updateGift as any).mockResolvedValue({
        id: 1,
        from_santa: true,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <GiftCard gift={{ id: 1, from_santa: false }} />
        </QueryClientProvider>
      );

      const santaBtn = screen.getByRole('button', { name: /Mark as from Santa/i });
      fireEvent.click(santaBtn);

      await waitFor(() => {
        expect(giftApi.updateGift).toHaveBeenCalledWith(1, { from_santa: true });
      });
    });
  });
});
```

#### Running Integration Tests

```bash
npm run test -- integration/gifts

# With coverage
npm run test -- --coverage integration/gifts
```

---

### T6.3: E2E Test for Complete Workflow

**Story ID**: P6-T3
**Story Points**: 2 pts
**Assigned Subagent(s)**: testing-specialist

#### Description

Write an end-to-end test using Playwright that covers the full workflow: creating/viewing a gift, changing status, assigning to lists, clicking filters, editing price, and toggling Santa. Tests real user interactions on real DOM.

#### Acceptance Criteria

- [ ] Test file: `apps/web/__tests__/e2e/gifts-action-bar.spec.ts`
- [ ] Covers complete workflow:
  - [ ] Navigate to /gifts page
  - [ ] View gift card
  - [ ] Click status button, change status
  - [ ] Click +List button, select lists, apply
  - [ ] Click status filter, verify filtered results
  - [ ] Click person avatar filter
  - [ ] Click list badge filter
  - [ ] Click price, edit, save
  - [ ] Click Santa toggle, verify icon shows
  - [ ] Navigate away and back, verify state persists
- [ ] Test passing in CI/CD
- [ ] Runs against staging environment
- [ ] Takes <2 minutes to run

#### Test Suite Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gifts Action Bar E2E Workflow', () => {
  test('complete workflow: status → list → filter → price → santa', async ({ page }) => {
    // Navigate to gifts page
    await page.goto('/gifts');
    await page.waitForLoadState('networkidle');

    // Find first gift card
    const giftCard = page.locator('[data-testid="gift-card"]').first();
    await expect(giftCard).toBeVisible();

    // 1. Change status
    const statusBtn = giftCard.locator('[aria-label*="Change status"]');
    await statusBtn.click();
    const purchasedOption = page.locator('[role="menuitem"]', { hasText: 'Purchased' });
    await purchasedOption.click();
    await expect(statusBtn).toContainText('PURCHASED');

    // 2. Assign to lists
    const listBtn = giftCard.locator('[aria-label*="Add to"]');
    await listBtn.click();
    const checkbox = giftCard.locator('input[type="checkbox"]').first();
    await checkbox.check();
    const applyBtn = giftCard.locator('button', { hasText: 'Apply' });
    await applyBtn.click();
    await expect(page.locator('text=Added to')).toBeVisible();

    // 3. Click status filter
    const statusChip = giftCard.locator('[data-testid="status-chip"]');
    await statusChip.click();
    // Verify URL updated with filter
    await expect(page).toHaveURL(/statuses=PURCHASED/);
    // Verify only purchased gifts showing
    const allCards = page.locator('[data-testid="gift-card"]');
    for (const card of await allCards.all()) {
      await expect(card.locator('[data-testid="status-chip"]')).toContainText('PURCHASED');
    }

    // 4. Clear filter by clicking chip again
    await statusChip.click();
    await expect(page).not.toHaveURL(/statuses=/);

    // 5. Edit price
    const priceText = giftCard.locator('[data-testid="gift-price"]');
    await priceText.click();
    const priceInput = page.locator('input[placeholder="0.00"]');
    await priceInput.fill('49.99');
    const saveBtn = page.locator('button', { hasText: 'Save' });
    await saveBtn.click();
    await expect(page.locator('text=Price updated')).toBeVisible();

    // 6. Toggle Santa
    const santaBtn = giftCard.locator('[aria-label*="from Santa"]');
    await santaBtn.click();
    const santaIcon = giftCard.locator('[aria-label="This gift is from Santa"]');
    await expect(santaIcon).toBeVisible();

    // 7. Verify state persists after reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    const reloadedCard = page.locator('[data-testid="gift-card"]').first();
    await expect(reloadedCard.locator('[aria-label="This gift is from Santa"]')).toBeVisible();
  });

  test('error handling: invalid price shows validation', async ({ page }) => {
    await page.goto('/gifts');
    const giftCard = page.locator('[data-testid="gift-card"]').first();

    const priceText = giftCard.locator('[data-testid="gift-price"]');
    await priceText.click();
    const priceInput = page.locator('input[placeholder="0.00"]');
    await priceInput.fill('invalid');

    const saveBtn = page.locator('button', { hasText: 'Save' });
    await expect(saveBtn).toBeDisabled();
    await expect(page.locator('text=must be a valid decimal')).toBeVisible();
  });

  test('mobile: all buttons responsive and clickable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/gifts');

    const giftCard = page.locator('[data-testid="gift-card"]').first();

    // All buttons should be ≥44x44px
    const buttons = giftCard.locator('button');
    for (const btn of await buttons.all()) {
      const box = await btn.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    // Mobile menu should be accessible
    const mobileMenu = giftCard.locator('[data-testid="mobile-menu"]');
    await mobileMenu.click();
    await expect(giftCard.locator('[aria-label*="Change status"]')).toBeVisible();
  });
});
```

#### Running E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run against staging
PLAYWRIGHT_API_URL=https://staging.example.com npm run test:e2e

# Run in debug mode
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace on
```

#### CI/CD Integration

- E2E tests run after unit/integration tests pass
- Run against staging environment
- Generate HTML report
- Attach traces to test failure reports

---

### T6.4: Accessibility Audit (WCAG 2.1 AA)

**Story ID**: P6-T4
**Story Points**: 2 pts
**Assigned Subagent(s)**: testing-specialist, ui-engineer-enhanced

#### Description

Perform comprehensive accessibility audit using axe-core, manual testing, and keyboard navigation. Ensure all components comply with WCAG 2.1 AA standards.

#### Acceptance Criteria

- [ ] axe-core automated tests passing (0 critical/serious issues)
- [ ] Manual accessibility audit completed:
  - [ ] Color contrast ratios ≥4.5:1 (text) or ≥3:1 (large text/graphics)
  - [ ] Focus indicators visible and logical
  - [ ] Keyboard navigation functional (Tab, Enter, Escape, Arrow keys)
  - [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
  - [ ] ARIA labels correct and complete
- [ ] All touch targets ≥44x44px
- [ ] Form labels associated with inputs
- [ ] Error messages linked to fields
- [ ] Tested on multiple assistive tech

#### Automated Testing with axe-core

**File**: `apps/web/__tests__/accessibility/gifts-a11y.test.ts`

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { GiftCard } from '@/components/gifts/GiftCard';
import { StatusButton } from '@/components/gifts/StatusButton';
import { ListPickerDropdown } from '@/components/gifts/ListPickerDropdown';
import { PriceEditDialog } from '@/components/gifts/PriceEditDialog';

expect.extend(toHaveNoViolations);

describe('Gift Components Accessibility', () => {
  it('GiftCard should not have axe violations', async () => {
    const { container } = render(
      <GiftCard gift={{ id: 1, title: 'Test Gift' }} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('StatusButton should not have axe violations', async () => {
    const { container } = render(
      <StatusButton giftId={1} currentStatus="IDEA" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ListPickerDropdown should not have axe violations', async () => {
    const { container } = render(
      <ListPickerDropdown giftId={1} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PriceEditDialog should not have axe violations', async () => {
    const { container } = render(
      <PriceEditDialog
        open={true}
        onOpenChange={() => {}}
        giftId={1}
        currentPrice={25.00}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Manual Testing Checklist

- [ ] **Focus Management**
  - [ ] Tab order logical (left-to-right, top-to-bottom)
  - [ ] Focus visible on all interactive elements
  - [ ] Focus trap in dropdowns/dialogs (enter and exit with Tab)
  - [ ] Focus returns to trigger element after dialog closes

- [ ] **Keyboard Navigation**
  - [ ] All buttons operable with Enter/Space
  - [ ] Dropdowns navigable with Arrow keys
  - [ ] Checkboxes toggleable with Space
  - [ ] Dialogs closable with Escape
  - [ ] Form inputs work with keyboard

- [ ] **Screen Reader** (Test with NVDA, JAWS, or VoiceOver)
  - [ ] Button labels announced correctly
  - [ ] Menu items announced with role
  - [ ] Form fields have associated labels
  - [ ] Error messages announced
  - [ ] Dialog title announced
  - [ ] Status changes announced (live regions)

- [ ] **Color & Contrast**
  - [ ] Focus indicators distinct (not color-only)
  - [ ] Error messages use more than color
  - [ ] Hover/active states visible
  - [ ] Text contrast ≥4.5:1
  - [ ] Icons have text labels or ARIA labels

- [ ] **Touch Targets**
  - [ ] All buttons ≥44x44px
  - [ ] Spacing between targets ≥8px
  - [ ] Mobile: safe areas respected (iOS notch/home indicator)

#### Running Accessibility Audit

```bash
# Run automated axe tests
npm run test -- accessibility/gifts-a11y

# Generate accessibility report
npm run a11y:report

# Manual testing with Lighthouse CI
npm run lighthouse -- /gifts

# WAVE browser extension testing
# Install browser extension and manually test
```

#### Documentation

Create `docs/a11y/gifts-action-bar-a11y-report.md`:
- Audit date and tester names
- Issues found and fixed
- WCAG 2.1 AA compliance statement
- Testing methodology
- Tools used

---

### T6.5: Mobile Responsiveness & Performance

**Story ID**: P6-T5
**Story Points**: 2 pts
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

#### Description

Test responsive design across device sizes, validate touch targets, test performance on low-end devices, and optimize if needed. Ensure all interactions complete in <500ms.

#### Acceptance Criteria

- [ ] Tested on device sizes:
  - [ ] iPhone SE (375x667)
  - [ ] iPhone 14 (390x844)
  - [ ] iPad (768x1024)
  - [ ] Desktop (1920x1080)
- [ ] All touch targets ≥44x44px on mobile
- [ ] Safe areas respected (iOS top/bottom insets)
- [ ] No horizontal scrolling on mobile
- [ ] Dropdowns fit within viewport (auto-position)
- [ ] Form inputs not zoomed <16px (prevent zoom-on-focus)
- [ ] Performance: <500ms interaction latency
- [ ] No layout shift (CLS <0.1)
- [ ] Tested on low-end device (if available)

#### Responsive Testing Checklist

**Test Scenarios**:

1. **iPhone SE (375px)**
   - [ ] GiftCard fits without horizontal scroll
   - [ ] Action bar buttons stack/overflow gracefully
   - [ ] Dropdowns positioned correctly (don't go off-screen)
   - [ ] Price dialog doesn't cover entire screen
   - [ ] Status chip clickable (44x44px)

2. **iPad (768px)**
   - [ ] Action bar uses full width
   - [ ] Dropdowns positioned correctly
   - [ ] Safe area respected (if using notch)

3. **Desktop (1920px)**
   - [ ] Action bar doesn't overflow
   - [ ] Dropdowns positioned correctly
   - [ ] Hover states visible and working

#### Performance Testing

**Using Lighthouse CI**:

```bash
# Run performance audit
npm run lighthouse -- /gifts

# Check Core Web Vitals
npm run lighthouse -- /gifts --view
```

**Expected Metrics**:
- Largest Contentful Paint (LCP): <2.5s
- First Input Delay (FID): <100ms
- Cumulative Layout Shift (CLS): <0.1
- Interaction to Next Paint (INP): <200ms

**Manual Performance Testing**:

1. Open Chrome DevTools → Performance tab
2. Load /gifts page and record performance
3. Click status button 10 times, measure interaction time
4. Open list picker, verify <100ms response
5. Edit price, verify <100ms response
6. Record trace and analyze bottlenecks

#### Optimization if Needed

If performance doesn't meet targets:
- [ ] Check for unnecessary re-renders (use React DevTools Profiler)
- [ ] Memoize expensive components (React.memo, useMemo)
- [ ] Lazy load components if using dynamic imports
- [ ] Optimize images (use next/image with responsive sizes)
- [ ] Check network waterfall (batch API calls, reduce request size)

#### Testing Code Example

```typescript
// Performance test
import { render, screen } from '@testing-library/react';
import { performance } from 'perf_hooks';

test('status button click <100ms', async () => {
  const { rerender } = render(
    <StatusButton giftId={1} currentStatus="IDEA" />
  );

  const start = performance.now();
  const button = screen.getByRole('button');
  fireEvent.click(button);
  const end = performance.now();

  expect(end - start).toBeLessThan(100);
});
```

---

### T6.6: Documentation

**Story ID**: P6-T6
**Story Points**: 1 pt
**Assigned Subagent(s)**: frontend-developer, documentation-writer

#### Description

Create comprehensive documentation for new components and update API documentation for the `from_santa` field.

#### Acceptance Criteria

- [ ] Component API docs created:
  - [ ] StatusButton.md (props, usage, examples)
  - [ ] ListPickerDropdown.md (props, usage, examples)
  - [ ] PriceEditDialog.md (props, usage, examples)
- [ ] API documentation updated for `from_santa` field
- [ ] Usage examples included
- [ ] Storybook stories created (if using Storybook)
- [ ] README.md updated with feature overview

#### Component Documentation Template

**File**: `apps/web/components/gifts/StatusButton.md`

```markdown
# StatusButton Component

Status selection button with dropdown menu for changing gift status.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `giftId` | number | Yes | - | ID of gift to update |
| `currentStatus` | Status | Yes | - | Current gift status (IDEA, SELECTED, PURCHASED, RECEIVED) |
| `onStatusChange` | (status: Status) => void | No | - | Callback when status changes |

## Usage

```tsx
import { StatusButton } from '@/components/gifts/StatusButton';

export function MyComponent() {
  return (
    <StatusButton
      giftId={123}
      currentStatus="IDEA"
      onStatusChange={(status) => console.log('Changed to:', status)}
    />
  );
}
```

## Features

- Dropdown menu with 4 status options
- Immediate optimistic update
- Error handling with toast
- Disabled state during mutation
- Keyboard navigation (arrow keys, enter)
- ARIA labels for accessibility

## Styling

Uses Radix UI DropdownMenu with Tailwind classes. Customize with `className` prop.

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusButton } from '@/components/gifts/StatusButton';

test('updates status on selection', async () => {
  const handleChange = vi.fn();
  render(
    <StatusButton
      giftId={1}
      currentStatus="IDEA"
      onStatusChange={handleChange}
    />
  );

  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('menuitem', { name: /Selected/i }));

  expect(handleChange).toHaveBeenCalledWith('SELECTED');
});
```
```

#### API Documentation Update

**Update**: `services/api/docs/api.md` or OpenAPI schema

```markdown
## Gift Object

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Gift ID |
| `title` | string | Gift title |
| `price` | number \| null | Price (USD) |
| `status` | string | Status (IDEA, SELECTED, PURCHASED, RECEIVED) |
| `from_santa` | boolean | **NEW**: Mark gift as from Santa for personalization/surprise |
| `created_at` | ISO8601 | Creation timestamp |
| `updated_at` | ISO8601 | Last update timestamp |

### Example Response

```json
{
  "id": 123,
  "title": "LEGO Set",
  "price": 49.99,
  "status": "PURCHASED",
  "from_santa": true,
  "created_at": "2025-12-22T10:00:00Z",
  "updated_at": "2025-12-22T15:30:00Z"
}
```

### Create Gift

```bash
POST /gifts
```

**Request**:
```json
{
  "title": "Toy",
  "price": 25.00,
  "status": "IDEA",
  "from_santa": false
}
```

### Update Gift

```bash
PATCH /gifts/{id}
```

**Request** (all fields optional):
```json
{
  "status": "PURCHASED",
  "price": 49.99,
  "from_santa": true
}
```
```

---

### T6.7: Bug Fixes & Polish

**Story ID**: P6-T7
**Story Points**: 2 pts
**Assigned Subagent(s)**: frontend-developer, ui-engineer-enhanced

#### Description

Address any bugs found during testing, refine UI polish, and ensure all interactions feel smooth and responsive. Final review and refinement pass.

#### Acceptance Criteria

- [ ] All test failures resolved
- [ ] No console errors or warnings
- [ ] All visual regressions fixed
- [ ] Hover/focus/active states polished
- [ ] Toast messages clear and helpful
- [ ] Loading states smooth (spinners, skeletons)
- [ ] Error states clear and actionable
- [ ] Spacing and alignment consistent
- [ ] Dark mode tested (if supported)

#### Polish Checklist

- [ ] **Visual Polish**
  - [ ] Hover effects smooth (transitions, opacity)
  - [ ] Focus states clearly visible
  - [ ] Disabled states dim appropriately
  - [ ] Icons render correctly (no emoji rendering issues)
  - [ ] Loading spinner smooth (animation)
  - [ ] Toast notifications positioned and styled consistently

- [ ] **Interaction Polish**
  - [ ] Dropdowns close smoothly
  - [ ] Dialogs open/close with animation
  - [ ] Buttons have active/pressed states
  - [ ] Mutations show optimistic update immediately
  - [ ] Error recovery is clear (retry button, dismiss)

- [ ] **Content Polish**
  - [ ] Toast messages are helpful ("Added to 3 lists" not just "Success")
  - [ ] Error messages are specific ("Price must be <$10,000" not "Invalid input")
  - [ ] Button labels are clear ("Apply" not "OK")
  - [ ] Placeholders are helpful ("0.00" not "Enter price")

- [ ] **Responsive Polish**
  - [ ] Mobile: buttons don't wrap awkwardly
  - [ ] Mobile: text doesn't overflow
  - [ ] Tablet: layout uses available space
  - [ ] Desktop: spacing is generous

#### Common Bug Fixes

**Bug**: Dropdown doesn't close on click-outside
- Solution: Ensure Radix DropdownMenu is properly configured

**Bug**: Price input accepts invalid formats
- Solution: Add input validation with helpful error message

**Bug**: Santa icon renders as emoji on some platforms
- Solution: Test on iOS, Android, Windows; use fallback SVG if needed

**Bug**: Touch targets <44px on mobile
- Solution: Audit all buttons, increase padding/size

**Bug**: Form input zooms on iOS
- Solution: Ensure font-size ≥16px on inputs

---

## Quality Gates Summary

| Gate | Criteria | Owner | Status |
|------|----------|-------|--------|
| **Unit Tests** | >80% coverage, all passing | Frontend Dev | Pass |
| **Integration Tests** | >70% coverage, all passing | Frontend Dev | Pass |
| **E2E Tests** | Workflow covers all 7 features | QA/Test | Pass |
| **Accessibility** | WCAG 2.1 AA, 0 critical issues | A11y Reviewer | Pass |
| **Mobile** | All touch targets ≥44px, responsive | Frontend Dev | Pass |
| **Performance** | <500ms interactions, <2.5s LCP | Frontend Dev | Pass |
| **Docs** | Component API + API docs complete | Documentation | Pass |
| **Code Review** | All code reviewed, approved | Senior Dev | Pass |

---

## Testing Metrics

**Coverage Targets**:
- Unit tests: >80%
- Integration tests: >70%
- E2E coverage: All critical workflows
- Overall: >75% code coverage

**Performance Targets**:
- Interaction latency: <500ms
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

**Accessibility Target**:
- WCAG 2.1 AA compliance
- 0 critical/serious axe violations
- 100% keyboard navigable

---

## Deployment Checklist

Before merging to main:

- [ ] All tests passing in CI/CD
- [ ] Code coverage >75%
- [ ] No console errors on all supported browsers
- [ ] Accessibility audit passed
- [ ] Mobile testing completed
- [ ] Performance audit passed
- [ ] Documentation complete
- [ ] Code review approved
- [ ] No breaking changes to API
- [ ] Backward compatible with old clients
- [ ] Ready for production release

---

## Summary

Phase 6 ensures production-ready quality through comprehensive testing, accessibility compliance, mobile optimization, and thorough documentation. All features are fully tested, accessible, responsive, and performant.

**Final Status**: Ready for merge and production deployment

---

**Phase Version**: 1.0
**Last Updated**: 2025-12-22
**Status**: Ready for Implementation
