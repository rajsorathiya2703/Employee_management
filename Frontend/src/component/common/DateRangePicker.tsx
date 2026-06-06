import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

// Field props from react-hook-form register()
export interface DateRangeFieldProps {
  name: string;
  onChange: InputHTMLAttributes<HTMLInputElement>['onChange'];
  onBlur: InputHTMLAttributes<HTMLInputElement>['onBlur'];
  ref: React.Ref<HTMLInputElement>;
}

export interface DateRangePickerProps {
  startLabel?: string;
  endLabel?: string;
  startName?: string;
  endName?: string;
  startValue?: string;
  endValue?: string;
  onStartChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  onEndChange?: InputHTMLAttributes<HTMLInputElement>['onChange'];
  startRegister?: Partial<DateRangeFieldProps>;
  endRegister?: Partial<DateRangeFieldProps>;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function DateRangePicker({
  startLabel = 'From',
  endLabel = 'To',
  startName,
  endName,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startRegister,
  endRegister,
  helperText,
  errorMessage,
  required,
  disabled,
  className,
}: DateRangePickerProps) {
  const baseInputCls = clsx(
    'border rounded-lg px-3 py-2 text-sm text-slate-700 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    errorMessage ? 'border-red-500' : 'border-slate-200'
  );

  const resolvedStartName = startRegister?.name ?? startName;
  const resolvedEndName = endRegister?.name ?? endName;

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Start date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={resolvedStartName}
            className="text-sm font-semibold text-slate-700"
          >
            {startLabel}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="date"
            id={resolvedStartName}
            disabled={disabled}
            max={endValue}
            value={startValue}
            onChange={onStartChange}
            className={baseInputCls}
            {...startRegister}
          />
        </div>

        {/* End date */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={resolvedEndName}
            className="text-sm font-semibold text-slate-700"
          >
            {endLabel}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="date"
            id={resolvedEndName}
            disabled={disabled}
            min={startValue}
            value={endValue}
            onChange={onEndChange}
            className={baseInputCls}
            {...endRegister}
          />
        </div>
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
