import { Clock, Eye } from 'lucide-react';
import type { FormattedCircular } from '../../types';

interface CircularCardProps {
  circular: FormattedCircular;
  onViewMore: (circular: FormattedCircular) => void;
}

export default function CircularCard({ circular, onViewMore }: CircularCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col p-5 gap-4 hover:shadow-md transition-shadow duration-200 h-full relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-indigo-500" />

      {/* Title */}
      <div>
        <h3 className="text-base font-bold text-slate-800 leading-snug">
          {circular.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-xs font-medium">
          <Clock size={14} strokeWidth={2} />
          <span>{circular.date}</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-slate-100" />

      {/* Body preview */}
      <p className="text-slate-500 text-[15px] leading-relaxed flex-1 line-clamp-4">
        {circular.body}
      </p>

      {/* View More button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={() => onViewMore(circular)}
          className="flex items-center gap-2 text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <Eye size={16} strokeWidth={2} />
          View More
        </button>
      </div>
    </div>
  );
}
