import { Controller } from 'react-hook-form';
import { Label } from '../ui/label.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';

export function SelectField({ id, name, control, label, placeholder, options, error }) {
  const errorId = error ? `${id}-err` : undefined;
  return (
    <div className="form-field">
      <Label htmlFor={id}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <SelectTrigger id={id} aria-invalid={Boolean(error)} aria-describedby={errorId}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p id={errorId} className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
