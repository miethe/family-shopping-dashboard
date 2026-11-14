/**
 * Switch Component Tests
 *
 * Tests the Switch toggle component behavior and rendering
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders with label', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        label="Test Label"
      />
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        label="Test"
        description="Test description"
      />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Switch
        checked={false}
        onCheckedChange={handleChange}
        label="Test"
      />
    );

    const switchElement = screen.getByRole('switch');
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('respects checked state', () => {
    render(
      <Switch
        checked={true}
        onCheckedChange={() => {}}
        label="Test"
      />
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('respects unchecked state', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        label="Test"
      />
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('can be disabled', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
        label="Test"
        disabled={true}
      />
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('renders without label and description', () => {
    render(
      <Switch
        checked={false}
        onCheckedChange={() => {}}
      />
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });
});
