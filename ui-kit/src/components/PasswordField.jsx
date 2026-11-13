// ui-kit/src/components/PasswordField.jsx
// Password input with a show/hide button. Works with react-hook-form's register():
//   <PasswordField label="Password" error={errors.password?.message} {...register("password")} />
import { forwardRef, useState } from 'react';
import FormField from './FormField.jsx';

const PasswordField = forwardRef(function PasswordField(
  {
    label = 'Password',
    hint,
    error,
    required = false,
    id,
    className = '',
    autoComplete = 'current-password',
    ...inputProps
  },
  ref,
) {
  const [visible, setVisible] = useState(false);

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
        <div className="input-group">
          <input
            ref={ref}
            type={visible ? 'text' : 'password'}
            autoComplete={autoComplete}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            {...controlProps}
            {...inputProps}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
          </button>
        </div>
      )}
    </FormField>
  );
});

export default PasswordField;
