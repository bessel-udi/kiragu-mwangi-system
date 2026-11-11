// ui-kit/src/components/SelectField.jsx
// Labelled dropdown. Options are [{ value, label }]. Works with react-hook-form's register():
//   <SelectField label="Category" options={categories} placeholder="Any" {...register("category")} />
import { forwardRef } from 'react';
import FormField from './FormField.jsx';

const SelectField = forwardRef(function SelectField(
  {
    label,
    hint,
    error,
    required = false,
    id,
    className = '',
    options = [],
    placeholder,
    ...selectProps
  },
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
        <select
          ref={ref}
          className={`form-select ${error ? 'is-invalid' : ''}`}
          {...controlProps}
          {...selectProps}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
});

export default SelectField;
