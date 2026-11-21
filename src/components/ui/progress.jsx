import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils.js';

export const Progress = React.forwardRef(
  ({ className, indicatorClassName, indicatorStyle, value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cn('dash-mix-track', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('dash-mix-fill', indicatorClassName)}
        style={{ width: `${value}%`, ...indicatorStyle }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = 'Progress';
