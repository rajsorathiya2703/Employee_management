import { ChangeEvent } from 'react';
import clsx from 'clsx';

export interface RadioOption {
  label: string;
  value: string | number;
}

export interface RadioButtonListProps {
  options: RadioOption[];
  name: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function RadioButtonList({
  options,
  name,
  value,
  onChange,
  onBlur,
  label,
  helperText,
  errorMessage,
  required,
  disabled,
  className,
}: RadioButtonListProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      // Preserve the original type — if option value is number, parse back
      const matched = options.find((o) => String(o.value) === e.target.value);
      onChange(matched ? matched.value : e.target.value);
    }
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-sm font-semibold text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}

      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={clsx(
              'flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={String(opt.value)}
              checked={value !== undefined ? String(value) === String(opt.value) : undefined}
              onChange={handleChange}
              onBlur={onBlur}
              disabled={disabled}
              className="accent-indigo-500 w-4 h-4 disabled:cursor-not-allowed"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
      {!errorMessage && helperText && (
        <span className="text-sm text-slate-400">{helperText}</span>
      )}
    </div>
  );
}
