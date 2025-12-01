import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IconProps {
  /** Material Symbol name (e.g., 'home', 'add', 'shopping_cart') */
  name: string;
  /** Size variant */
  size?: IconSize;
  /** Use filled variant */
  filled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Hide from screen readers (decorative icon) */
  'aria-hidden'?: boolean;
}

const sizeClasses: Record<IconSize, string> = {
  xs: 'text-sm',      // 14px
  sm: 'text-base',    // 16px
  md: 'text-xl',      // 20px
  lg: 'text-2xl',     // 24px (default)
  xl: 'text-3xl',     // 30px
  '2xl': 'text-4xl',  // 36px
};

/**
 * Icon component wrapping Material Symbols Outlined
 *
 * @example
 * <Icon name="home" />
 * <Icon name="add" size="lg" filled />
 * <Icon name="shopping_cart" className="text-primary" />
 */
export function Icon({
  name,
  size = 'lg',
  filled = false,
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = !ariaLabel,
}: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined',
        sizeClasses[size],
        filled && 'filled',
        className
      )}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaLabel ? 'img' : undefined}
    >
      {name}
    </span>
  );
}

// Common icon name constants for autocomplete and consistency
export const IconNames = {
  // Navigation
  home: 'home',
  list: 'list_alt',
  people: 'groups',
  calendar: 'calendar_month',
  gift: 'card_giftcard',
  stats: 'bar_chart',

  // Actions
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  close: 'close',
  search: 'search',
  more: 'more_horiz',

  // Status
  idea: 'lightbulb',
  cart: 'shopping_cart',
  check: 'check_circle',
  volunteer: 'volunteer_activism',

  // UI
  arrowForward: 'arrow_forward',
  arrowBack: 'arrow_back',
  chevronDown: 'expand_more',
  chevronUp: 'expand_less',
  openNew: 'open_in_new',
  kanban: 'view_kanban',
  table: 'table_rows',
  celebration: 'celebration',
  autoAwesome: 'auto_awesome',

  // Items
  headphones: 'headphones',
  watch: 'watch',
  coffee: 'coffee_maker',
  description: 'description',
  shoppingBag: 'shopping_bag',
} as const;

export type IconName = typeof IconNames[keyof typeof IconNames];
