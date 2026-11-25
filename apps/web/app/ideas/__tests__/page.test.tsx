import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import IdeasPage from '../page';

const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/hooks/useGifting', () => ({
  useGiftingIdeas: () => ({ data: [{ id: 7, name: 'Puzzle', price: null, quantity: 1, url: null }], isLoading: false, error: null, refetch: vi.fn() }),
}));

describe('Ideas page', () => {
  it('opens an idea and links to the gift catalog', () => {
    render(<IdeasPage />);
    expect(screen.getByRole('link', { name: /all gifts & status/i })).toHaveAttribute('href', '/gifts');
    fireEvent.click(screen.getByRole('link', { name: 'Open Puzzle' }));
    expect(push).toHaveBeenCalledWith('/gifts/7');
  });
});
