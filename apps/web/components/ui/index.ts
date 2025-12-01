/**
 * UI Component Library
 *
 * Base components built on Radix UI primitives with mobile-first design.
 * All interactive components meet 44px touch target requirements.
 */

export { Button, buttonVariants, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
export { Checkbox, type CheckboxProps } from './checkbox';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
export { Spinner, type SpinnerProps } from './spinner';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './toast';
export { Toaster } from './toaster';
export { useToast, toast } from './use-toast';
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  getInitials,
} from './avatar';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  type SkeletonProps,
} from './skeleton';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export {
  StatusPill,
  type GiftStatus,
  type StatusPillProps,
} from './status-pill';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';
export {
  Icon,
  IconNames,
  type IconProps,
  type IconSize,
  type IconName,
} from './icon';
export {
  StatsCard,
  statsCardVariants,
  type StatsCardProps,
} from './stats-card';
export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
  timelineDotVariants,
  type TimelineDotProps,
} from './timeline';
export {
  FilterBar,
  FilterGroup,
  FilterChip,
  FilterDropdown,
  type FilterBarProps,
  type FilterGroupProps,
  type FilterChipProps,
  type FilterDropdownProps,
  type FilterDropdownOption,
} from './filter-bar';
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TablePagination,
  TableEmpty,
  type TableProps,
  type TableRowProps,
  type TablePaginationProps,
  type TableEmptyProps,
} from './table';
