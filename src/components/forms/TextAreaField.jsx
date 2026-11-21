import { FormItem, FormMessage } from '../ui/form.jsx';
import { Label } from '../ui/label.jsx';
import { Textarea } from '../ui/textarea.jsx';

export function TextAreaField({ id, label, placeholder, maxLength, rows = 5, error, register }) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <FormItem id={id}>
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        {...register}
      />
      <FormMessage id={errorId}>{error}</FormMessage>
    </FormItem>
  );
}
