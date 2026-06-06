import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CheckBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const CheckBox = forwardRef<HTMLInputElement, CheckBoxProps>(
  (
    {
      checked,
      onChange,
      name,
      label,
      helperText,
      errorMessage,
      required,
      disabled,
      className,
      onBlur,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', className)}>
        <label
          className={clsx(
            'flex items-center gap-2 cursor-pointer w-fit',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="checkbox"
            id={name}
            name={name}
            ref={ref}
            checked={checked}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(e) => onChange?.(e.target.checked)}
            className="accent-indigo-500 w-4 h-4 shrink-0 disabled:cursor-not-allowed"
            {...rest}
          />
          {label && (
            <span className="text-sm text-slate-700 select-none">
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          )}
        </label>

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

CheckBox.displayName = 'CheckBox';

export default CheckBox;
