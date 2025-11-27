import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  GiftIcon,
  ListIcon,
  ClipboardListIcon
} from './icons';

export interface NavItem {
  href: string;
  label: string;
  icon: typeof HomeIcon;
}

export const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: HomeIcon
  },
  {
    href: '/assignments',
    label: 'Assignments',
    icon: ClipboardListIcon
  },
  {
    href: '/people',
    label: 'People',
    icon: UsersIcon
  },
  {
    href: '/occasions',
    label: 'Occasions',
    icon: CalendarIcon
  },
  {
    href: '/gifts',
    label: 'Gifts',
    icon: GiftIcon
  },
  {
    href: '/lists',
    label: 'Lists',
    icon: ListIcon
  },
] as const satisfies readonly NavItem[];
