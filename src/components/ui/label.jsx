import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils.js';

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('ck-label', className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
