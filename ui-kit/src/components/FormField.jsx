// ui-kit/src/components/FormField.jsx
// Form field wrapper: label, optional hint, the control, and an inline error message.
// The control is passed as a function so it receives the right id and aria attributes:
//   <FormField label="Email" error={errors.email?.message} required>
//     {(controlProps) => <input className="form-control" {...controlProps} {...register("email")} />}
//   </FormField>
import { useId } from 'react';

export default function FormField({
  label,
  hint,
  error,
  required = false,
  id,
  className = '',
  children,
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // Props the control must receive so the label, hint and error are wired for screen readers
  const controlProps = {
    id: fieldId,
    'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
  };

  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger ms-1">
            *
          </span>
        )}
      </label>
      {children(controlProps)}
      {hint && (
        <div id={hintId} className="form-text">
          {hint}
        </div>
      )}
      {error && (
        <div id={errorId} role="alert" className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}
