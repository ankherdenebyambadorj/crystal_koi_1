import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '../../lib/utils.js';

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport ref={ref} className={cn('ck-toast-viewport', className)} {...props} />
));
ToastViewport.displayName = 'ToastViewport';

export const Toast = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(
      'ck-glass ck-toast',
      variant === 'error' ? 'ck-toast--error' : undefined,
      className,
    )}
    {...props}
  />
));
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Title ref={ref} className={cn('ck-toast-title', className)} {...props} />
));
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Description ref={ref} className={cn('ck-toast-desc', className)} {...props} />
));
ToastDescription.displayName = 'ToastDescription';

export const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    aria-label="Хаах"
    className={cn('ck-toast-close', className)}
    {...props}
  />
));
ToastClose.displayName = 'ToastClose';

const toastListeners = new Set();

export function notifyToast(item) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: item.title,
    description: item.description || '',
    variant: item.variant || 'default',
  };
  toastListeners.forEach((fn) => fn(entry));
}

export function Toaster() {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    const onToast = (entry) => setItems((prev) => [...prev.slice(-2), entry]);
    toastListeners.add(onToast);
    return () => {
      toastListeners.delete(onToast);
    };
  }, []);

  return (
    <ToastProvider swipeDirection="right" duration={3600}>
      {items.map((item) => (
        <Toast
          key={item.id}
          variant={item.variant}
          onOpenChange={(open) => {
            if (!open) setItems((prev) => prev.filter((t) => t.id !== item.id));
          }}
        >
          <div className="ck-toast-body">
            {item.title && <ToastTitle>{item.title}</ToastTitle>}
            {item.description && <ToastDescription>{item.description}</ToastDescription>}
          </div>
          <ToastClose>×</ToastClose>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
