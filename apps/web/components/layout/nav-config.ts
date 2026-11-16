/**
 * Navigation configuration using Material Symbols icons
 * Icons reference: https://fonts.google.com/icons
 */

export interface NavItem {
  href: string;
  label: string;
  icon: string; // Material Symbols icon name
}

export const navItems = [
  {
    href: '/dashboard',
    label: 'Events',
    icon: 'home'
  },
  { href: '/ideas', label: 'Ideas', icon: 'lightbulb' },
  { href: '/budgets', label: 'Budget', icon: 'savings' },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: 'assignment'
  },
  {
    href: '/people',
    label: 'People',
    icon: 'groups'
  },
  {
    href: '/occasions',
    label: 'Occasions',
    icon: 'calendar_month'
  },
  {
    href: '/gifts',
    label: 'Gifts',
    icon: 'card_giftcard'
  },
  {
    href: '/lists',
    label: 'Lists',
    icon: 'list_alt'
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: 'settings'
  },
] as const satisfies readonly NavItem[];
