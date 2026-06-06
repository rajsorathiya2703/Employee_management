import { Eye, Download } from 'lucide-react';
import clsx from 'clsx';
import type { SalarySlipRaw } from '../../types';

interface SalarySlipCardProps {
  slip: SalarySlipRaw;
  onView: (slip: SalarySlipRaw) => void;
  onDownload: (slip: SalarySlipRaw) => void;
  className?: string;
}

const fmt = (val: string | number) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const monthLabel = (salaryMonth: string) => {
  const [year, month] = salaryMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return `${date.toLocaleString('en-US', { month: 'long' })}-${year}`;
};

export default function SalarySlipCard({ slip, onView, onDownload, className }: SalarySlipCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border-l-4 border-l-indigo-400 border border-slate-200',
        'shadow-sm p-4 flex flex-col gap-3 min-w-[220px] max-w-[260px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">{monthLabel(slip.salaryMonth)}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(slip)}
            className="text-indigo-400 hover:text-indigo-600 transition-colors"
            title="View details"
          >
            <Eye size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDownload(slip)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="Download PDF"
          >
            <Download size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100" />

      {/* Summary rows */}
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Gross Salary (A)</span>
          <span className="text-slate-700 font-medium">{fmt(slip.grossSalary)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Deduction (B)</span>
          <span className="text-slate-700 font-medium">{fmt(slip.totalDeductions)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-700 font-bold">Net Pay (A-B)</span>
          <span className="text-emerald-600 font-bold">{fmt(slip.netPay)}</span>
        </div>
      </div>
    </div>
  );
}
