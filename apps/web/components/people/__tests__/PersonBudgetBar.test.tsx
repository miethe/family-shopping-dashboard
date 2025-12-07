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
  it('renders budget data correctly in modal variant', () => {
    mockUsePersonBudget.mockReturnValue({
      data: {
        person_id: 1,
        occasion_id: null,
        gifts_assigned_count: 3,
        gifts_assigned_total: 150.0,
        gifts_purchased_count: 2,
        gifts_purchased_total: 89.99,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    // Check "Gifts to Give" section
    expect(screen.getByText('Gifts to Give')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText(/3 gifts/)).toBeInTheDocument();

    // Check "Gifts Purchased" section
    expect(screen.getByText('Gifts Purchased')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    expect(screen.getByText(/2 gifts/)).toBeInTheDocument();
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
    mockUsePersonBudget.mockReturnValue({
      data: {
        person_id: 1,
        occasion_id: null,
        gifts_assigned_count: 1,
        gifts_assigned_total: 50.0,
        gifts_purchased_count: 0,
        gifts_purchased_total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<PersonBudgetBar personId={1} variant="card" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('$50.00')).toBeInTheDocument();
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
    mockUsePersonBudget.mockReturnValue({
      data: {
        person_id: 1,
        occasion_id: null,
        gifts_assigned_count: 1,
        gifts_assigned_total: 1234.56,
        gifts_purchased_count: 1,
        gifts_purchased_total: 0.99,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('$0.99')).toBeInTheDocument();
  });

  it('handles singular vs plural gift labels', () => {
    mockUsePersonBudget.mockReturnValue({
      data: {
        person_id: 1,
        occasion_id: null,
        gifts_assigned_count: 1,
        gifts_assigned_total: 50.0,
        gifts_purchased_count: 5,
        gifts_purchased_total: 200.0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<PersonBudgetBar personId={1} variant="modal" />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText(/1 gift/)).toBeInTheDocument();
    expect(screen.getByText(/5 gifts/)).toBeInTheDocument();
  });
});
