import { Clock } from 'lucide-react';
import type { AttendanceSession } from '../../types';

interface DetailSessionLogCardProps {
  sessions: AttendanceSession[];
  totalMinutes: number;
  /** Number of table columns — used for the colSpan so the card spans the full row */
  colSpan: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimeWithSeconds(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatDuration(_durationMinute: number, punchIn: string, punchOut: string | null) {
  if (!punchOut) return 'Active';

  // Use actual diff in seconds for precise display
  const diffSec = Math.floor(
    (new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 1000
  );

  if (diffSec < 60) return `${diffSec} sec${diffSec !== 1 ? 's' : ''}`;
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m} min`;
  }
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTotalTime(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  // If we have raw seconds available use them — otherwise just show minutes
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DetailSessionLogCard({
  sessions,
  totalMinutes,
  colSpan,
}: DetailSessionLogCardProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 pb-4 pt-0 bg-white">
        <div className="mx-2 mt-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <Clock size={15} className="text-indigo-500" strokeWidth={2.5} />
            <span className="text-sm font-semibold text-slate-700">
              Detailed Sessions Log&nbsp;
              <span className="text-slate-400 font-normal">(Time to Time with Seconds)</span>
            </span>
          </div>

          {/* Session rows */}
          <div className="divide-y divide-slate-50">
            {sessions.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-400">No sessions recorded.</p>
            ) : (
              sessions.map((session, i) => {
                const inTime  = formatTimeWithSeconds(session.punchIn);
                const outTime = session.punchOut
                  ? formatTimeWithSeconds(session.punchOut)
                  : 'Active';
                const dur = formatDuration(
                  session.durationMinute,
                  session.punchIn,
                  session.punchOut
                );

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between px-5 py-2.5 text-sm hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700 w-20 shrink-0">
                        Session {i + 1}:
                      </span>
                      <span className="text-slate-600">
                        {inTime}
                        <span className="mx-2 text-slate-300">—</span>
                        <span
                          className={
                            session.punchOut
                              ? 'text-slate-600'
                              : 'text-emerald-500 font-medium'
                          }
                        >
                          {outTime}
                        </span>
                      </span>
                    </div>
                    <span className="text-slate-500 font-medium shrink-0 ml-4">{dur}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer — Total */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
            <span className="text-sm font-semibold text-slate-700">Total Hours Today:</span>
            <span className="font-bold text-slate-800 font-mono text-sm">
              {formatTotalTime(totalMinutes)}
            </span>
          </div>

        </div>
      </td>
    </tr>
  );
}
