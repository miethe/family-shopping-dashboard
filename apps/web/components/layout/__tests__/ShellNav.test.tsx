import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DesktopNav } from '../DesktopNav';
import { MobileNav } from '../MobileNav';
import { navItems } from '../nav-config';
import { AppLayout } from '../AppLayout';
import { PageHeader } from '../PageHeader';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, logout: vi.fn() }) }));
vi.mock('@/components/quick-add', () => ({ QuickAddButton: () => null, QuickAddModal: () => null }));
vi.mock('../Header', () => ({ Header: () => null }));

describe('shell navigation', () => {
  it('renders every desktop destination with its label', () => {
    const { container } = render(<DesktopNav />);
    const sidebar = container.querySelector('aside')!;
    const nav = sidebar.querySelector('nav')!;
    expect(sidebar).toHaveClass('club-sidebar');
    expect(nav.className).not.toMatch(/overflow-[xy]-(auto|scroll|hidden)/);
    for (const item of navItems) {
      const link = within(nav).getByRole('link', { name: item.label });
      expect(link).toHaveTextContent(item.label);
      expect(within(link).getByText(item.label)).toBeVisible();
      expect(link).toHaveClass('min-h-[44px]');
    }
  });
  it('uses matching sidebar offset and normal phone content padding', () => {
    render(<AppLayout><p>Page content</p></AppLayout>);
    const main = screen.getByRole('main');
    expect(main.parentElement).toHaveClass('club-content', 'min-w-0');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByText('Page content').parentElement).not.toHaveClass('pr-20');
  });
  it('stacks the title and actions on small screens', () => {
    render(<PageHeader title="Gift Catalog" actions={<button>Add Gift</button>} />);
    const row = screen.getByRole('heading', { name: 'Gift Catalog' }).parentElement!.parentElement!;
    expect(row).toHaveClass('flex-col', 'sm:flex-row');
    expect(row).toContainElement(screen.getByRole('button', { name: 'Add Gift' }));
  });
  it('opens the remaining destinations and closes after selecting one', () => {
    render(<MobileNav />);
    const bar = screen.getByRole('navigation', { name: 'Main navigation' });
    for (const label of ['Home', 'People', 'Gifts', 'Events']) {
      expect(within(bar).getByText(label)).toBeVisible();
    }
    expect(within(bar).getAllByRole('link')).toHaveLength(4);
    expect(within(bar).getAllByRole('button')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    const dialog = screen.getByRole('dialog');
    for (const label of ['Ideas', 'Budget', 'Assignments', 'Occasions', 'Lists', 'Admin']) {
      expect(within(dialog).getByRole('link', { name: label })).toBeInTheDocument();
    }
    fireEvent.click(within(dialog).getByRole('link', { name: 'Ideas' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
