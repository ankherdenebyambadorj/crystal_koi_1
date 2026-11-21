import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';
import { cn } from '../../lib/utils.js';
import { Label } from './label.jsx';

export const Form = FormProvider;

const FormFieldContext = React.createContext({});
const FormItemContext = React.createContext({});

export function FormField(props) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const fieldCtx = React.useContext(FormFieldContext);
  const itemCtx = React.useContext(FormItemContext);
  const formCtx = useFormContext();
  const id = itemCtx.id || React.useId();
  const fieldState =
    formCtx && fieldCtx.name ? formCtx.getFieldState(fieldCtx.name, formCtx.formState) : {};

  return {
    id,
    name: fieldCtx.name,
    formItemId: id,
    formDescriptionId: `${id}-desc`,
    formMessageId: `${id}-err`,
    error: fieldState.error,
  };
}

export const FormItem = React.forwardRef(({ className, id, ...props }, ref) => {
  const fallbackId = React.useId();
  const itemId = id || fallbackId;
  return (
    <FormItemContext.Provider value={{ id: itemId }}>
      <div ref={ref} className={cn('form-field', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();
  return <Label ref={ref} htmlFor={formItemId} className={className} {...props} />;
});
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error ? formMessageId : undefined}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return <p ref={ref} id={formDescriptionId} className={cn('ck-form-desc', className)} {...props} />;
});
FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef(({ className, children, id, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error?.message || children;
  if (!body) return null;
  return (
    <p ref={ref} id={id || formMessageId} className={cn('form-error', className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';
