import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils.js';

const VARIANT_CLASSES = {
  fill: 'ck-btn ck-btn--fill',
  ghost: 'ck-btn ck-btn--ghost',
  dark: 'ck-btn ck-btn--dk',
  white: 'ck-btn ck-btn--white',
};

const Button = React.forwardRef(
  ({ className, variant = 'fill', asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(VARIANT_CLASSES[variant] || VARIANT_CLASSES.fill, className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
