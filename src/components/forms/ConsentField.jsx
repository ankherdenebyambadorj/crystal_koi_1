import { Controller } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox.jsx';
import { Label } from '../ui/label.jsx';

export function ConsentField({ id, name, control, label, error }) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <div className="form-field">
      <div className="form-consent-row">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={id}
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              aria-invalid={Boolean(error)}
              aria-describedby={errorId}
            />
          )}
        />
        <Label htmlFor={id} className="form-consent-label">
          {label}
        </Label>
      </div>
      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
