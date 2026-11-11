// ui-kit/src/components/DateField.jsx
// Labelled date input. The value is "YYYY-MM-DD". Use min/max to block past or far-future dates.
// The browser's date input cannot block Sundays, so pages must also check that themselves.
//   <DateField label="Viewing date" min={today} error={errors.date?.message} {...register("date")} />
import { forwardRef } from 'react';
import FormField from './FormField.jsx';

const DateField = forwardRef(function DateField(
  { label, hint, error, required = false, id, className = '', ...inputProps },
  ref,
) {
  return (
    <FormField
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={className}
    >
      {(controlProps) => (
        <input
          ref={ref}
          type="date"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          {...controlProps}
          {...inputProps}
        />
      )}
    </FormField>
  );
});

export default DateField;
