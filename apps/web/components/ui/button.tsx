import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-low hover:shadow-medium active:shadow-subtle focus-visible:ring-primary-500 focus-visible:ring-offset-bg-base',
        secondary: 'bg-transparent text-warm-900 border-2 border-warm-300 hover:bg-warm-100 hover:border-warm-400 active:bg-warm-200 focus-visible:ring-primary-500',
        ghost: 'bg-transparent text-warm-900 hover:bg-warm-100 active:bg-warm-200 focus-visible:ring-primary-500',
        tertiary: 'bg-transparent text-primary-600 hover:text-primary-700 hover:bg-warm-100 active:bg-warm-200 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
        destructive: 'bg-status-warning-500 text-white hover:bg-status-warning-600 active:bg-status-warning-700 shadow-low hover:shadow-medium focus-visible:ring-status-warning-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        sm: 'px-4 py-2 text-sm rounded-medium h-8',
        md: 'px-6 py-3 text-base font-semibold rounded-large h-11',
        lg: 'px-8 py-4 text-lg rounded-xlarge h-13',
        xl: 'px-10 py-5 text-xl font-bold rounded-2xlarge h-16',
        icon: 'h-11 w-11 rounded-large',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Spinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
