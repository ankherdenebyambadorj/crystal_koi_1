import { cn } from '../../lib/utils.js';

const ALERT_VARIANTS = {
  error: 'ck-alert--error',
  success: 'ck-alert--success',
};

export function Alert({ className, variant = 'error', role = 'alert', children, ...props }) {
  return (
    <div
      role={role}
      className={cn('ck-glass ck-alert', ALERT_VARIANTS[variant] || ALERT_VARIANTS.error, className)}
      {...props}
    >
      {children}
    </div>
  );
}
