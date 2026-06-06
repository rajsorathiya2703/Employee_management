import clsx from 'clsx';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  name,
  label,
  helperText,
  errorMessage,
  disabled,
  className,
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={name}
          onClick={handleClick}
          disabled={disabled}
          className={clsx(
            'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-1',
            checked ? 'bg-indigo-500' : 'bg-slate-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span
            className={clsx(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm',
              'absolute top-0.5 transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>

        {label && (
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        )}
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
