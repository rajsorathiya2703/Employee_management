import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  phoneMode?: boolean;
  className?: string;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      helperText,
      errorMessage,
      required,
      disabled,
      phoneMode,
      className,
      value,
      onChange,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const resolvedType = phoneMode ? 'tel' : type;
    const inputMode = phoneMode ? 'numeric' : undefined;

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
          id={name}
          name={name}
          ref={ref}
          type={resolvedType}
          inputMode={inputMode}
          placeholder={placeholder}
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

TextInput.displayName = 'TextInput';

export default TextInput;
