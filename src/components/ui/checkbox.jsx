import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../lib/utils.js';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} className={cn('ck-checkbox', className)} {...props}>
    <CheckboxPrimitive.Indicator className="ck-checkbox-indicator">
      <svg viewBox="0 0 12 12" fill="none" className="ck-checkbox-check" aria-hidden="true">
        <path
          d="M2.5 6.3L5 8.8L9.5 3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
