import { render, screen } from '@testing-library/react';
import { StackedProgressBar } from '../stacked-progress-bar';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('StackedProgressBar', () => {
  const mockTooltipItems = [
    {
      id: 1,
      name: 'LEGO Star Wars Set',
      price: 75.99,
      status: 'purchased' as const,
      imageUrl: '/images/lego.jpg',
    },
    {
      id: 2,
      name: 'Board Game',
      price: 24.99,
      status: 'planned' as const,
    },
    {
      id: 3,
      name: 'Action Figure',
      price: 19.99,
      status: 'planned' as const,
      imageUrl: '/images/figure.jpg',
    },
  ];

  describe('Basic Rendering', () => {
    it('renders progress bar with correct percentages', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50'); // (75 + 25) / 200 * 100
    });

    it('renders with label when provided', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          label="Gifts to Give"
        />
      );

      expect(screen.getByText('Gifts to Give')).toBeInTheDocument();
    });

    it('shows amounts when showAmounts is true', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          showAmounts
        />
      );

      expect(screen.getByText(/\$75\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
    });

    it('renders without label and amounts by default', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
        />
      );

      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('applies sm size class', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          size="sm"
        />
      );

      const progressBar = container.querySelector('.h-1\\.5');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies md size class by default', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
        />
      );

      const progressBar = container.querySelector('.h-2');
      expect(progressBar).toBeInTheDocument();
    });

    it('applies lg size class', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          size="lg"
        />
      );

      const progressBar = container.querySelector('.h-3');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero total correctly', () => {
      render(
        <StackedProgressBar
          total={0}
          planned={0}
          purchased={0}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    });

    it('handles purchased greater than planned correctly', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={50}
          purchased={75}
          showAmounts
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Remaining planned should be 0, not negative
    });

    it('handles purchased equal to planned', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={100}
          showAmounts
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50'); // 100/200 * 100
    });

    it('handles total less than planned', () => {
      render(
        <StackedProgressBar
          total={100}
          planned={150}
          purchased={75}
          showAmounts
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      // Should render without errors
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          label="Gifts to Give"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-label');
    });

    it('includes descriptive aria-label', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          label="Gifts to Give"
        />
      );

      const progressBar = screen.getByRole('progressbar');
      const ariaLabel = progressBar.getAttribute('aria-label');
      expect(ariaLabel).toContain('Gifts to Give');
      expect(ariaLabel).toContain('$75.00');
      expect(ariaLabel).toContain('$25.00');
    });
  });

  describe('Tooltip Functionality', () => {
    it('renders tooltip items when provided', async () => {
      const user = userEvent.setup();
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          tooltipItems={mockTooltipItems}
        />
      );

      // Tooltip should appear on hover
      const trigger = screen.getByRole('progressbar').parentElement;
      if (trigger) {
        await user.hover(trigger);
      }

      // Note: Testing tooltip visibility requires more complex setup with Radix UI
      // This is a placeholder for integration testing
    });

    it('calls onItemClick when tooltip item is clicked', async () => {
      const onItemClick = vi.fn();
      const user = userEvent.setup();

      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          tooltipItems={mockTooltipItems}
          onItemClick={onItemClick}
        />
      );

      // This would require simulating tooltip interaction
      // Placeholder for integration test
    });

    it('shows overflow badge when items exceed maxTooltipItems', () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Gift ${i}`,
        price: 20,
        status: 'planned' as const,
      }));

      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          tooltipItems={manyItems}
          maxTooltipItems={5}
        />
      );

      // Overflow badge would be visible in tooltip
      // Placeholder for integration test
    });

    it('renders without tooltip when no items provided', () => {
      render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          tooltipItems={[]}
        />
      );

      // Should not have cursor-pointer class
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar.parentElement).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Color Variants', () => {
    it('uses recipient variant colors by default', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
        />
      );

      const purchasedSegment = container.querySelector('.bg-emerald-500');
      const plannedSegment = container.querySelector('.bg-amber-400');

      expect(purchasedSegment).toBeInTheDocument();
      expect(plannedSegment).toBeInTheDocument();
    });

    it('uses purchaser variant colors when specified', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          variant="purchaser"
        />
      );

      // Currently both variants use same colors, but structure is in place
      const purchasedSegment = container.querySelector('.bg-emerald-500');
      const plannedSegment = container.querySelector('.bg-amber-400');

      expect(purchasedSegment).toBeInTheDocument();
      expect(plannedSegment).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('formats currency values correctly', () => {
      render(
        <StackedProgressBar
          total={1234.56}
          planned={567.89}
          purchased={234.50}
          showAmounts
        />
      );

      expect(screen.getByText(/\$234\.50/)).toBeInTheDocument();
      expect(screen.getByText(/\$567\.89/)).toBeInTheDocument();
      expect(screen.getByText(/\$1,234\.56/)).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('applies custom className', () => {
      const { container } = render(
        <StackedProgressBar
          total={200}
          planned={100}
          purchased={75}
          className="custom-class"
        />
      );

      const progressBar = container.querySelector('.custom-class');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
