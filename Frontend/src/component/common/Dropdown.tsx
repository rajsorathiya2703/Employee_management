import { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface DropdownProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'placeholder'> {
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      options,
      label,
      name,
      placeholder,
      helperText,
      errorMessage,
      required,
      disabled,
      className,
      value,
      onChange,
      onBlur,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={name}
            className="text-sm font-semibold text-slate-700"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <select
          id={name}
          name={name}
          ref={ref}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={clsx(
            'border rounded-lg px-3 py-2 text-sm text-slate-700 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            errorMessage ? 'border-red-500' : 'border-slate-200'
          )}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {errorMessage && (
          <span className="text-sm text-red-500">{errorMessage}</span>
        )}
        {!errorMessage && helperText && (
          <span className="text-sm text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
