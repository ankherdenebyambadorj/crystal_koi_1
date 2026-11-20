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
    <div className="form-field">
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
      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
