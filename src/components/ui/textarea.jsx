import * as React from 'react';
import { cn } from '../../lib/utils.js';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('ck-textarea', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export { Textarea };
