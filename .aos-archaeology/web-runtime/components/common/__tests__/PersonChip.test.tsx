/**
 * PersonChip Component Tests
 *
 * Tests for PersonChip component behavior and accessibility.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonChip } from '../PersonChip';
import type { Person } from '@/types';

const mockPerson: Person = {
  id: 1,
  display_name: 'John Doe',
  relationship: 'Brother',
  photo_url: undefined,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('PersonChip', () => {
  it('renders person name', () => {
    render(<PersonChip person={mockPerson} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders avatar with initials fallback', () => {
    render(<PersonChip person={mockPerson} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('calls onToggle with person id when clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<PersonChip person={mockPerson} onToggle={handleToggle} />);

    const chip = screen.getByRole('button', { name: /select john doe/i });
    await user.click(chip);

    expect(handleToggle).toHaveBeenCalledWith(1);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('applies selected styles when selected', () => {
    render(<PersonChip person={mockPerson} selected={true} />);

    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('bg-primary/10');
    expect(chip).toHaveClass('border-primary/30');
  });

  it('applies unselected styles when not selected', () => {
    render(<PersonChip person={mockPerson} selected={false} />);

    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('bg-muted/50');
  });

  it('has correct aria-pressed state', () => {
    const { rerender } = render(
      <PersonChip person={mockPerson} selected={false} onToggle={vi.fn()} />
    );

    let chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('aria-pressed', 'false');

    rerender(<PersonChip person={mockPerson} selected={true} onToggle={vi.fn()} />);

    chip = screen.getByRole('button');
    expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  it('is disabled when no onToggle handler provided', () => {
    render(<PersonChip person={mockPerson} />);

    const chip = screen.getByRole('button');
    expect(chip).toBeDisabled();
  });

  it('meets minimum touch target height (44px)', () => {
    render(<PersonChip person={mockPerson} />);

    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('min-h-[44px]');
  });

  it('renders without tooltip when showTooltip is false', () => {
    render(<PersonChip person={mockPerson} showTooltip={false} />);

    const chip = screen.getByRole('button');
    expect(chip).toBeInTheDocument();
    // Tooltip trigger should not be present
    expect(chip.closest('[data-radix-tooltip-trigger]')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<PersonChip person={mockPerson} className="custom-class" />);

    const chip = screen.getByRole('button');
    expect(chip).toHaveClass('custom-class');
  });

  it('renders avatar image when photo_url is provided', () => {
    const personWithPhoto: Person = {
      ...mockPerson,
      photo_url: 'https://example.com/photo.jpg',
    };

    render(<PersonChip person={personWithPhoto} />);

    // Avatar component renders the image with empty alt by default
    const img = screen.getByRole('img', { hidden: true });
    expect(img).toBeInTheDocument();
  });

  it('shows relationship in tooltip when provided', async () => {
    const user = userEvent.setup();

    render(<PersonChip person={mockPerson} showTooltip={true} />);

    const chip = screen.getByRole('button');
    await user.hover(chip);

    // Wait for tooltip to appear - use getAllByText since it might render twice
    const relationships = await screen.findAllByText('Brother');
    expect(relationships.length).toBeGreaterThan(0);
  });

  it('handles person without relationship', () => {
    const personNoRelationship: Person = {
      ...mockPerson,
      relationship: undefined,
    };

    render(<PersonChip person={personNoRelationship} />);

    const chip = screen.getByRole('button');
    expect(chip).toBeInTheDocument();
  });
});
