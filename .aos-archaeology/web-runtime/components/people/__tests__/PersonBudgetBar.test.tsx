/**
 * PersonBudgetBar Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonBudgetBar } from '../PersonBudgetBar';
import * as usePersonBudgetHook from '@/hooks/usePersonBudget';

// Mock the usePersonBudget hook
vi.mock('@/hooks/usePersonBudget');

const mockUsePersonBudget = vi.mocked(usePersonBudgetHook.usePersonBudget);

/** A complete PersonBudget payload (all role fields), overridable per test. */
function budgetData(overrides: Record<string, number | null> = {}) {
  return {
    person_id: 1,
    occasion_id: null,
    gifts_assigned_count: 0,
    gifts_assigned_total: 0,
    gifts_assigned_purchased_count: 0,
    gifts_assigned_purchased_total: 0,
    gifts_purchased_count: 0,
    gifts_purchased_total: 0,
    gifts_to_purchase_count: 0,
    gifts_to_purchase_total: 0,
    ...overrides,
  };
}

function mockBudget(overrides: Record<string, number | null> = {}) {
  mockUsePersonBudget.mockReturnValue({
    data: budgetData(overrides),
    isLoading: false,
    isError: false,
    error: null,
  } as any);
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('PersonBudgetBar', () => {
  it('renders recipient and purchaser totals in modal variant (no budgets set)', () => {
    mockBudget({
      gifts_assigned_count: 3,
      gifts_assigned_total: 150.0,
      gifts_assigned_purchased_count: 1,
      gifts_assigned_purchased_total: 50.0,
      gifts_purchased_count: 2,
      gifts_purchased_total: 89.99,
      gifts_to_purchase_count: 1,
      gifts_to_purchase_total: 10.0,
    });

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    // Gifts TO this person: purchased / planned (= total - purchased) / total
    expect(screen.getByText('Gifts to Receive')).toBeInTheDocument();
    expect(screen.getByText('Purchased: $50.00')).toBeInTheDocument();
    expect(screen.getByText('Planned: $100.00')).toBeInTheDocument();
    expect(screen.getByText('Total: $150.00')).toBeInTheDocument();

    // Gifts BY this person: total = to-purchase + purchased
    expect(screen.getByText('Gifts to Buy')).toBeInTheDocument();
    expect(screen.getByText('Purchased: $89.99')).toBeInTheDocument();
    expect(screen.getByText('Planned: $10.00')).toBeInTheDocument();
    expect(screen.getByText('Total: $99.99')).toBeInTheDocument();
  });

  it('does not render in card variant when no budget data exists', () => {
    mockUsePersonBudget.mockReturnValue({
      data: {
        person_id: 1,
        occasion_id: null,
        gifts_assigned_count: 0,
        gifts_assigned_total: 0,
        gifts_purchased_count: 0,
        gifts_purchased_total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<PersonBudgetBar personId={1} variant="card" />, {
      wrapper: TestWrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  it('renders in card variant when budget data exists', () => {
    mockBudget({ gifts_assigned_count: 1, gifts_assigned_total: 50.0 });

    render(<PersonBudgetBar personId={1} variant="card" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('Total: $50.00')).toBeInTheDocument();
  });

  it('shows loading skeleton in modal variant', () => {
    mockUsePersonBudget.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('does not render in card variant while loading', () => {
    mockUsePersonBudget.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<PersonBudgetBar personId={1} variant="card" />, {
      wrapper: TestWrapper,
    });

    expect(container.firstChild).toBeNull();
  });

  it('formats currency correctly', () => {
    mockBudget({
      gifts_assigned_count: 1,
      gifts_assigned_total: 1234.56,
      gifts_purchased_count: 1,
      gifts_purchased_total: 0.99,
    });

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('Total: $1,234.56')).toBeInTheDocument();
    expect(screen.getByText('Purchased: $0.99')).toBeInTheDocument();
  });

  it('hides a role section that has neither a budget nor gifts', () => {
    mockBudget({ gifts_purchased_count: 5, gifts_purchased_total: 200.0 });

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    expect(screen.queryByText('Gifts to Receive')).not.toBeInTheDocument();
    expect(screen.getByText('Gifts to Buy')).toBeInTheDocument();
    expect(screen.getByText('Total: $200.00')).toBeInTheDocument();
  });

});
