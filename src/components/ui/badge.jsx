import { cn } from '../../lib/utils.js';

const BADGE_VARIANTS = {
  neutral: 'ck-badge--neutral',
  live: 'ck-badge--live',
  warn: 'ck-badge--warn',
  danger: 'ck-badge--danger',
};

export function Badge({ className, variant = 'neutral', children, ...props }) {
  return (
    <span className={cn('ck-badge', BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral, className)} {...props}>
      {children}
    </span>
  );
}
