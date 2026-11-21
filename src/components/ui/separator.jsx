import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils.js';

export const Separator = React.forwardRef(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        orientation === 'vertical' ? 'ck-separator ck-separator--vertical' : 'ck-separator',
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';
