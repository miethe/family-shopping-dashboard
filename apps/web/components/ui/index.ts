/**
 * UI Component Library
 *
 * Base components built on Radix UI primitives with mobile-first design.
 * All interactive components meet 44px touch target requirements.
 */

export { Button, buttonVariants, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
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
