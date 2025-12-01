'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',      // 24px
        sm: 'h-8 w-8',      // 32px
        default: 'h-10 w-10',    // 40px (alias for md)
        md: 'h-10 w-10',    // 40px
        lg: 'h-14 w-14',    // 56px
        xl: 'h-20 w-20',    // 80px
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: 'active' | 'inactive' | 'away';
  badge?: number;
  withRing?: boolean;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, status, badge, withRing, ...props }, ref) => (
  <div className="relative inline-block">
    {/* Status ring background (gradient pulse for "needs attention") */}
    {withRing && (
      <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-br from-status-success-400 to-status-success-600 animate-pulse" />
    )}

    {/* Avatar container */}
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        avatarVariants({ size }),
        'border-2 border-white shadow-low relative',
        className
      )}
      {...props}
    />

    {/* Status indicator dot at bottom-right */}
    {status && (
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
          size === 'xs' && 'w-2 h-2',
          size === 'sm' && 'w-2.5 h-2.5',
          (size === 'md' || size === 'default') && 'w-3 h-3',
          size === 'lg' && 'w-4 h-4',
          size === 'xl' && 'w-5 h-5',
          status === 'active' && 'bg-status-success-500',
          status === 'away' && 'bg-status-idea-500',
          status === 'inactive' && 'bg-warm-300'
        )}
      />
    )}

    {/* Badge (gift count) at bottom-right */}
    {badge !== undefined && (
      <span
        className={cn(
          'absolute -bottom-1 -right-1 rounded-full bg-primary-500 text-white font-bold flex items-center justify-center border-2 border-white shadow-medium',
          size === 'xs' && 'w-4 h-4 text-[10px]',
          size === 'sm' && 'w-5 h-5 text-xs',
          (size === 'md' || size === 'default') && 'w-6 h-6 text-xs',
          size === 'lg' && 'w-7 h-7 text-sm',
          size === 'xl' && 'w-8 h-8 text-sm'
        )}
      >
        {badge}
      </span>
    )}
  </div>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-warm-100 text-warm-700 font-medium',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Helper function to generate initials from a name
 * Returns 'U' as fallback for undefined/null/empty names
 */
export function getInitials(name: string | undefined | null): string {
  if (!name || name.trim() === '') {
    return 'U';  // Fallback for "User"
  }

  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)  // Remove empty strings
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * AvatarStack - Display multiple avatars in an overlapping stack
 *
 * Features:
 * - Overlapping avatars with negative spacing
 * - Hover animation to spread avatars apart
 * - Overflow indicator (+N) when exceeding max
 * - z-index ordering (first avatar on top)
 */
interface AvatarStackProps extends VariantProps<typeof avatarVariants> {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

const AvatarStack = React.forwardRef<HTMLDivElement, AvatarStackProps>(
  ({ children, max = 5, size = 'md', className }, ref) => {
    const childArray = React.Children.toArray(children);
    const displayedAvatars = max ? childArray.slice(0, max) : childArray;
    const overflowCount = childArray.length - displayedAvatars.length;

    // Spacing values based on size
    const spacingMap = {
      xs: '-space-x-2',      // -8px overlap
      sm: '-space-x-2.5',    // -10px overlap
      default: '-space-x-3', // -12px overlap
      md: '-space-x-3',      // -12px overlap
      lg: '-space-x-4',      // -16px overlap
      xl: '-space-x-6',      // -24px overlap
    };

    const hoverSpacingMap = {
      xs: 'hover:space-x-1',      // 4px spacing on hover
      sm: 'hover:space-x-1.5',    // 6px spacing on hover
      default: 'hover:space-x-2', // 8px spacing on hover
      md: 'hover:space-x-2',      // 8px spacing on hover
      lg: 'hover:space-x-3',      // 12px spacing on hover
      xl: 'hover:space-x-4',      // 16px spacing on hover
    };

    const spacing = spacingMap[size || 'md'];
    const hoverSpacing = hoverSpacingMap[size || 'md'];

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          spacing,
          hoverSpacing,
          'transition-all duration-300 ease-in-out',
          className
        )}
      >
        {displayedAvatars.map((child, index) => (
          <div
            key={index}
            className="transition-all duration-300 ease-in-out"
            style={{
              zIndex: displayedAvatars.length - index, // First avatar on top
            }}
          >
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                  size: size || 'md',
                })
              : child}
          </div>
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'border-2 border-white shadow-low bg-warm-200 flex items-center justify-center font-bold text-warm-700 transition-all duration-300 ease-in-out'
            )}
            style={{ zIndex: 0 }}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    );
  }
);
AvatarStack.displayName = 'AvatarStack';

export { Avatar, AvatarImage, AvatarFallback, AvatarStack };
