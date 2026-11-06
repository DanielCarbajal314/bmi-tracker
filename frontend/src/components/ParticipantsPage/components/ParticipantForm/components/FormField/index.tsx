import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useFormField } from './hooks/use-form-field';
import type { FormFieldProps } from './types/form-field-props.types';

export function FormField({ form, name, label, numeric = false, ...inputProps }: FormFieldProps) {
  const { error, errorId, registration } = useFormField(form, name, numeric);

  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        {...registration}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
