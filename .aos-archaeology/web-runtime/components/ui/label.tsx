import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-xs font-semibold text-warm-800 uppercase tracking-wide',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-status-warning-600 ml-1">*</span>}
      </label>
    );
  }
);
Label.displayName = 'Label';

export { Label };
