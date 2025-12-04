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
    label: 'Dashboard',
    icon: 'home'
  },
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
] as const satisfies readonly NavItem[];
