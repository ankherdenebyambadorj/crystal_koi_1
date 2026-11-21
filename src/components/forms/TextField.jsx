import { FormItem, FormMessage } from '../ui/form.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';

export function TextField({
  id,
  label,
  type = 'text',
  placeholder,
  autoComplete,
  maxLength,
  error,
  register,
}) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <FormItem id={id}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...register}
      />
      <FormMessage id={errorId}>{error}</FormMessage>
    </FormItem>
  );
}
