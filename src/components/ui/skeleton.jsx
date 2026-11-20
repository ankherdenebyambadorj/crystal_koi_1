import { cn } from '../../lib/utils.js';

export function Skeleton({ className, ...props }) {
  return <div className={cn('ck-skeleton', className)} aria-hidden="true" {...props} />;
}
