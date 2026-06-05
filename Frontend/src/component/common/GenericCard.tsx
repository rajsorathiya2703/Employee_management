import { ReactNode } from 'react';
import clsx from 'clsx';

type CardColor = 'purple' | 'blue' | 'sky' | 'yellow' | 'green' | 'red' | 'teal' | 'navy';
type IconPosition = 'left' | 'right';

interface ColorStyle {
  border: string;
  bg: string;
  text: string;
}

const colorStyles: Record<CardColor, ColorStyle> = {
  purple: { border: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-500' },
  blue:   { border: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-500' },
  sky:    { border: 'bg-sky-500',    bg: 'bg-sky-50',    text: 'text-sky-500' },
  yellow: { border: 'bg-amber-400',  bg: 'bg-amber-50',  text: 'text-amber-500' },
  green:  { border: 'bg-emerald-500',bg: 'bg-emerald-50',text: 'text-emerald-500' },
  red:    { border: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-500' },
  teal:   { border: 'bg-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-500' },
  navy:   { border: 'bg-slate-700',  bg: 'bg-slate-100', text: 'text-slate-700' },
};

interface GenericCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  color?: CardColor;
  className?: string;
}

export default function GenericCard({
  title,
  value,
  icon,
  iconPosition = 'right',
  color = 'blue',
  className,
}: GenericCardProps) {
  const isLeft = iconPosition === 'left';
  const styles = colorStyles[color] ?? colorStyles.blue;

  return (
    <div
      className={clsx(
        'relative bg-white rounded-xl shadow-sm border border-slate-100 flex items-center p-5 overflow-hidden pl-6 transition-all hover:shadow-md',
        isLeft ? 'justify-start gap-5' : 'justify-between',
        className
      )}
    >
      {/* Left Colored Accent Border */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-[5px]', styles.border)} />

      {/* Icon (Left Position) */}
      {isLeft && icon && (
        <div
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            styles.bg,
            styles.text
          )}
        >
          {icon}
        </div>
      )}

      {/* Content */}
      <div className={clsx('flex flex-col', isLeft ? 'gap-0' : 'gap-1')}>
        <span
          className={clsx(
            'font-semibold text-slate-500',
            isLeft ? 'text-sm' : 'text-xs uppercase tracking-wider'
          )}
        >
          {title}
        </span>
        <span
          className={clsx(
            'font-bold text-slate-800',
            isLeft ? 'text-lg mt-0.5' : 'text-2xl'
          )}
        >
          {value}
        </span>
      </div>

      {/* Icon (Right Position) */}
      {!isLeft && icon && (
        <div
          className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            styles.bg,
            styles.text
          )}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
