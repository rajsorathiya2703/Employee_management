import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface DatePickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  className?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      name,
      helperText,
      errorMessage,
      required,
      disabled,
      min,
      max,
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

        <input
          type="date"
          id={name}
          name={name}
          ref={ref}
          min={min}
          max={max}
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
        />

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

DatePicker.displayName = 'DatePicker';

export default DatePicker;
