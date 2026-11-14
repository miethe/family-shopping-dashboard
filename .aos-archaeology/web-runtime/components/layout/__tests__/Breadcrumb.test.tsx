/**
 * Breadcrumb Component Tests
 *
 * Tests breadcrumb navigation rendering across main routes including:
 * - Basic breadcrumb rendering
 * - Link behavior and current page styling
 * - Mobile truncation
 * - Accessibility (aria-current, role)
 * - PageHeader integration
 * - Route-specific breadcrumb paths
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Breadcrumb, BreadcrumbItem } from '../Breadcrumb';
import { PageHeader } from '../PageHeader';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Breadcrumb', () => {
  describe('Basic Rendering', () => {
    it('renders with correct items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'LEGO Set' },
      ];

      render(<Breadcrumb items={items} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Gifts')).toBeInTheDocument();
      expect(screen.getByText('LEGO Set')).toBeInTheDocument();
    });

    it('renders with navigation role', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
    });

    it('returns null when items array is empty', () => {
      const { container } = render(<Breadcrumb items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when items is undefined', () => {
      const { container } = render(<Breadcrumb items={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Link Behavior', () => {
    it('renders parent items as clickable links', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const giftsLink = screen.getByText('Gifts').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(giftsLink).toHaveAttribute('href', '/gifts');
    });

    it('last item is not a link (current page)', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const currentItem = screen.getByText('Current');
      expect(currentItem.tagName).toBe('SPAN');
      expect(currentItem.closest('a')).toBeNull();
    });

    it('renders item without href as span even if not last', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard' }, // No href
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const dashboardItem = screen.getByText('Dashboard');
      expect(dashboardItem.tagName).toBe('SPAN');
    });
  });

  describe('Chevron Separators', () => {
    it('shows chevron separators between items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'Current' },
      ];

      const { container } = render(<Breadcrumb items={items} />);

      const chevrons = container.querySelectorAll('svg');
      // Should have 2 chevrons for 3 items
      expect(chevrons).toHaveLength(2);
    });

    it('does not show chevron after last item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(<Breadcrumb items={items} />);

      // Find all list items
      const listItems = container.querySelectorAll('li');
      const lastListItem = listItems[listItems.length - 1];

      // Last list item should not contain a chevron icon
      const chevronInLast = lastListItem.querySelector('svg');
      expect(chevronInLast).toBeNull();
    });

    it('shows single chevron for two items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(<Breadcrumb items={items} />);

      const chevrons = container.querySelectorAll('svg');
      expect(chevrons).toHaveLength(1);
    });
  });

  describe('Accessibility', () => {
    it('sets aria-current="page" on current item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current Page' },
      ];

      render(<Breadcrumb items={items} />);

      const currentItem = screen.getByText('Current Page');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });

    it('does not set aria-current on parent items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const dashboardLink = screen.getByText('Dashboard');
      const giftsLink = screen.getByText('Gifts');

      expect(dashboardLink).not.toHaveAttribute('aria-current');
      expect(giftsLink).not.toHaveAttribute('aria-current');
    });

    it('uses ordered list for breadcrumb items', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(<Breadcrumb items={items} />);

      const ol = container.querySelector('ol');
      expect(ol).toBeInTheDocument();
    });
  });

  describe('Styling and Truncation', () => {
    it('applies truncation class for mobile responsiveness', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Very Long Dashboard Label That Should Truncate', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const longLabel = screen.getByText('Very Long Dashboard Label That Should Truncate');
      expect(longLabel).toHaveClass('truncate');
      expect(longLabel).toHaveClass('max-w-[200px]');
    });

    it('applies different styling to current item', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current Page' },
      ];

      render(<Breadcrumb items={items} />);

      const currentItem = screen.getByText('Current Page');
      expect(currentItem).toHaveClass('font-medium');
    });

    it('applies custom className when provided', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(<Breadcrumb items={items} className="custom-class" />);

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-class');
    });
  });
});

describe('PageHeader with Breadcrumbs', () => {
  describe('Breadcrumb Integration', () => {
    it('shows breadcrumbs when breadcrumbItems provided', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'LEGO Set' },
      ];

      render(
        <PageHeader
          title="LEGO Set"
          breadcrumbItems={breadcrumbItems}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Gifts')).toBeInTheDocument();
    });

    it('does not show breadcrumbs when breadcrumbItems not provided', () => {
      render(<PageHeader title="Test Page" />);

      const nav = screen.queryByRole('navigation', { name: /breadcrumb/i });
      expect(nav).not.toBeInTheDocument();
    });

    it('breadcrumbs are hidden on mobile (hidden md:block)', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(
        <PageHeader
          title="Test Page"
          breadcrumbItems={breadcrumbItems}
        />
      );

      // Find the breadcrumb container div
      const breadcrumbContainer = container.querySelector('.hidden.md\\:block');
      expect(breadcrumbContainer).toBeInTheDocument();
    });
  });

  describe('Back Button on Mobile', () => {
    it('shows back button when backHref provided', () => {
      render(
        <PageHeader
          title="Test Page"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveAttribute('href', '/dashboard');
    });

    it('back button is hidden on desktop (md:hidden)', () => {
      const { container } = render(
        <PageHeader
          title="Test Page"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');
      expect(backButton).toHaveClass('md:hidden');
    });

    it('does not show back button when backHref not provided', () => {
      render(<PageHeader title="Test Page" />);

      expect(screen.queryByText('Back')).not.toBeInTheDocument();
    });

    it('back button has proper touch target size', () => {
      render(
        <PageHeader
          title="Test Page"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');
      expect(backButton).toHaveClass('min-h-[44px]');
    });
  });

  describe('Legacy Breadcrumb Support', () => {
    it('shows legacy breadcrumb when provided and no breadcrumbItems', () => {
      render(
        <PageHeader
          title="Test Page"
          breadcrumb={<span>Legacy breadcrumb</span>}
        />
      );

      expect(screen.getByText('Legacy breadcrumb')).toBeInTheDocument();
    });

    it('prefers breadcrumbItems over legacy breadcrumb', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(
        <PageHeader
          title="Test Page"
          breadcrumb={<span>Legacy breadcrumb</span>}
          breadcrumbItems={breadcrumbItems}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Legacy breadcrumb')).not.toBeInTheDocument();
    });
  });

  describe('Complete Header Rendering', () => {
    it('renders title, subtitle, breadcrumbs, and actions together', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(
        <PageHeader
          title="Test Page"
          subtitle="This is a subtitle"
          breadcrumbItems={breadcrumbItems}
          actions={<button>Action Button</button>}
        />
      );

      expect(screen.getByText('Test Page')).toBeInTheDocument();
      expect(screen.getByText('This is a subtitle')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });
  });
});

describe('Route-Specific Breadcrumb Integration', () => {
  describe('Gift Detail Route (/gifts/[id])', () => {
    it('shows Dashboard > Gifts > {name} breadcrumb path', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Gifts', href: '/gifts' },
        { label: 'LEGO Star Wars Set' },
      ];

      render(
        <PageHeader
          title="LEGO Star Wars Set"
          breadcrumbItems={breadcrumbItems}
        />
      );

      // Verify breadcrumb navigation is present
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      // Verify link structure within navigation
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const giftsLink = screen.getByText('Gifts').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(giftsLink).toHaveAttribute('href', '/gifts');

      // Current page should not be a link - find the span with aria-current
      const currentItem = screen.getByText('LEGO Star Wars Set', { selector: 'span[aria-current="page"]' });
      expect(currentItem.tagName).toBe('SPAN');
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('List Detail Route (/lists/[id])', () => {
    it('shows Dashboard > Lists > {name} breadcrumb path', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Lists', href: '/lists' },
        { label: 'Christmas 2024' },
      ];

      render(
        <PageHeader
          title="Christmas 2024"
          breadcrumbItems={breadcrumbItems}
        />
      );

      // Verify breadcrumb navigation is present
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const listsLink = screen.getByText('Lists').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(listsLink).toHaveAttribute('href', '/lists');

      // Current page should have aria-current
      const currentItem = screen.getByText('Christmas 2024', { selector: 'span[aria-current="page"]' });
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Person Detail Route (/people/[id])', () => {
    it('shows Dashboard > People > {name} breadcrumb path', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'People', href: '/people' },
        { label: 'John Doe' },
      ];

      render(
        <PageHeader
          title="John Doe"
          breadcrumbItems={breadcrumbItems}
        />
      );

      // Verify breadcrumb navigation is present
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const peopleLink = screen.getByText('People').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(peopleLink).toHaveAttribute('href', '/people');

      // Current page should have aria-current
      const currentItem = screen.getByText('John Doe', { selector: 'span[aria-current="page"]' });
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Occasion Detail Route (/occasions/[id])', () => {
    it('shows Dashboard > Occasions > {name} breadcrumb path', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Occasions', href: '/occasions' },
        { label: 'Birthday 2025' },
      ];

      render(
        <PageHeader
          title="Birthday 2025"
          breadcrumbItems={breadcrumbItems}
        />
      );

      // Verify breadcrumb navigation is present
      const nav = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const occasionsLink = screen.getByText('Occasions').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(occasionsLink).toHaveAttribute('href', '/occasions');

      // Current page should have aria-current
      const currentItem = screen.getByText('Birthday 2025', { selector: 'span[aria-current="page"]' });
      expect(currentItem).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Nested Routes', () => {
    it('handles deep navigation paths', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Lists', href: '/lists' },
        { label: 'Christmas 2024', href: '/lists/1' },
        { label: 'Edit' },
      ];

      render(<Breadcrumb items={breadcrumbItems} />);

      // Should render all 4 items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Lists')).toBeInTheDocument();
      expect(screen.getByText('Christmas 2024')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();

      // Should have 3 chevrons
      const { container } = render(<Breadcrumb items={breadcrumbItems} />);
      const chevrons = container.querySelectorAll('svg');
      expect(chevrons).toHaveLength(3);
    });

    it('handles single item breadcrumb (no parent)', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard' },
      ];

      render(<Breadcrumb items={breadcrumbItems} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();

      // Should have no chevrons
      const { container } = render(<Breadcrumb items={breadcrumbItems} />);
      const chevrons = container.querySelectorAll('svg');
      expect(chevrons).toHaveLength(0);
    });
  });
});

describe('Responsive Behavior', () => {
  describe('Desktop View', () => {
    it('breadcrumb container has hidden md:block classes', () => {
      const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      const { container } = render(
        <PageHeader
          title="Test"
          breadcrumbItems={breadcrumbItems}
        />
      );

      const breadcrumbContainer = container.querySelector('.hidden.md\\:block');
      expect(breadcrumbContainer).toBeInTheDocument();
    });

    it('back button has md:hidden class', () => {
      render(
        <PageHeader
          title="Test"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');
      expect(backButton).toHaveClass('md:hidden');
    });
  });

  describe('Mobile View', () => {
    it('breadcrumb labels have max-width for truncation', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Very Long Label', href: '/test' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const longLabel = screen.getByText('Very Long Label');
      expect(longLabel).toHaveClass('max-w-[200px]');
      expect(longLabel).toHaveClass('sm:max-w-none');
    });

    it('back button is visible on mobile with proper styling', () => {
      render(
        <PageHeader
          title="Test"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');

      // Mobile specific classes
      expect(backButton).toHaveClass('mb-3');
      expect(backButton).toHaveClass('min-h-[44px]');
      expect(backButton).toHaveClass('inline-flex');
      expect(backButton).toHaveClass('items-center');
    });
  });

  describe('Responsive Transitions', () => {
    it('breadcrumb links have transition classes', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Current' },
      ];

      render(<Breadcrumb items={items} />);

      const link = screen.getByText('Dashboard');
      expect(link).toHaveClass('transition-colors');
      expect(link).toHaveClass('duration-200');
    });

    it('back button has transition classes', () => {
      render(
        <PageHeader
          title="Test"
          backHref="/dashboard"
        />
      );

      const backButton = screen.getByText('Back').closest('a');
      expect(backButton).toHaveClass('transition-colors');
    });
  });
});
