import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => (
  <input ref={ref} type={type} className={cn('ck-input', className)} {...props} />
));
Input.displayName = 'Input';

export { Input };
