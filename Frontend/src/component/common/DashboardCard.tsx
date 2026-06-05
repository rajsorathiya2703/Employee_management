import { ReactNode } from 'react';
import clsx from 'clsx';

type DashboardCardColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'sky'
  | 'teal'
  | 'orange'
  | 'indigo';

interface ColorConfig {
  iconBg: string;
  iconText: string;
}

const colorConfig: Record<DashboardCardColor, ColorConfig> = {
  blue:   { iconBg: 'bg-blue-50',   iconText: 'text-blue-500' },
  green:  { iconBg: 'bg-emerald-50',iconText: 'text-emerald-500' },
  yellow: { iconBg: 'bg-amber-50',  iconText: 'text-amber-500' },
  red:    { iconBg: 'bg-red-50',    iconText: 'text-red-500' },
  purple: { iconBg: 'bg-purple-50', iconText: 'text-purple-500' },
  sky:    { iconBg: 'bg-sky-50',    iconText: 'text-sky-500' },
  teal:   { iconBg: 'bg-teal-50',   iconText: 'text-teal-500' },
  orange: { iconBg: 'bg-orange-50', iconText: 'text-orange-500' },
  indigo: { iconBg: 'bg-indigo-50', iconText: 'text-indigo-500' },
};

export interface DashboardCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: DashboardCardColor;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  color = 'blue',
  className,
}: DashboardCardProps) {
  const { iconBg, iconText } = colorConfig[color] ?? colorConfig.blue;

  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between',
        'hover:shadow-md transition-shadow duration-200 min-h-[120px]',
        className
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-slate-500 leading-tight">{title}</span>
        <div
          className={clsx(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            iconBg,
            iconText
          )}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <span className="text-[28px] font-bold text-slate-800 leading-none mt-3">{value}</span>
    </div>
  );
}
