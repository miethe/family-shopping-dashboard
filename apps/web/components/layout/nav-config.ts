export interface NavItem { href: string; label: string; icon: string }
export const navItems = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/events', label: 'Events', icon: 'calendar' },
  { href: '/people', label: 'People', icon: 'people' },
  { href: '/gifts', label: 'Gifts', icon: 'gift' },
  { href: '/ideas', label: 'Ideas', icon: 'idea' },
  { href: '/lists', label: 'Lists', icon: 'list' },
  { href: '/occasions', label: 'Occasions', icon: 'calendar' },
  { href: '/assignments', label: 'Assignments', icon: 'list' },
  { href: '/budgets', label: 'Budget', icon: 'budget' },
  { href: '/admin', label: 'Admin', icon: 'admin' },
] as const satisfies readonly NavItem[];
export const isDestinationActive = (pathname: string | null, href: string) => pathname === href || !!pathname?.startsWith(href + '/');
