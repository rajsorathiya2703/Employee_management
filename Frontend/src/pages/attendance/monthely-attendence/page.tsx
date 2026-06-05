import { useState, useEffect } from 'react';
import {
  CalendarDays,
  BriefcaseBusiness,
  ClipboardCheck,
  UserX,
  LogIn,
  Ban,
  Leaf,
  Plus,
  Clock,
  UserRoundX,
  Timer,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';
import { getMonthlyAttendance } from '../../../service/attendance.service';
import type { MonthlyAttendanceData, CalendarDayStatus } from '../../../types';

// ─── Constants ────────────────────────────────────────────────────────────────
import { useAuth } from '../../../context/AuthContext';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const YEARS  = [2024, 2025, 2026, 2027];
const DOW    = ['SU','MO','TU','WE','TH','FR','SA'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function minutesToHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m} min`;
}

function minutesToHHMM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

function minutesToHMCompact(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0 && m === 0) return '0h 0 min';
  if (h === 0) return `${m} min`;
  return `${h}h ${m} min`;
}

// ─── Stat Card (left panel) ───────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string; // tailwind border-color class
}

function StatCard({ label, value, icon, accentColor }: StatCardProps) {
  return (
    <div className={clsx(
      'bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 px-4 py-3',
      'border-l-4', accentColor
    )}>
      <div className="shrink-0 text-slate-400">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-slate-500 font-medium leading-tight">{label}</span>
        <span className="text-base font-bold text-slate-800 leading-snug">{value}</span>
      </div>
    </div>
  );
}

// ─── Donut / Total Spent widget ───────────────────────────────────────────────

function TotalSpentWidget({ workedMin, targetMin }: { workedMin: number; targetMin: number }) {
  const pct   = targetMin > 0 ? Math.min(1, workedMin / targetMin) : 0;
  const r     = 40;
  const circ  = 2 * Math.PI * r;
  const dash  = circ * pct;

  const workedH = Math.floor(workedMin / 60);
  const workedM = workedMin % 60;
  const targetH = Math.floor(targetMin / 60);
  const targetM = targetMin % 60;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col items-center justify-center gap-2 min-h-[140px]">
      <div className="relative flex items-center justify-center">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke="#6366f1" strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[9px] text-slate-500 font-medium">Total Spent</span>
          <span className="text-sm font-bold text-slate-800 leading-tight">
            {workedH}h {workedM}m
          </span>
        </div>
      </div>
      <span className="text-[11px] text-slate-400">
        Target: {targetH}h {targetM}m
      </span>
    </div>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<CalendarDayStatus, string> = {
  PRESENT:  'bg-blue-500',
  ABSENT:   'bg-red-400',
  HALF_DAY: 'bg-amber-400',
  WEEK_OFF: 'bg-teal-400',
};

interface CalendarProps {
  month: number;   // 1-12
  year: number;
  daysInMonth: number;
  calendarMap: Record<string, CalendarDayStatus>;
}

function AttendanceCalendar({ month, year, daysInMonth, calendarMap }: CalendarProps) {
  // Day-of-week the 1st falls on (0=Sun)
  const startDow = new Date(year, month - 1, 1).getDay();

  // Build cells: null = empty padding, number = day
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const toKey = (d: number) => {
    const mm = String(month).padStart(2,'0');
    const dd = String(d).padStart(2,'0');
    return `${year}-${mm}-${dd}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pb-1 border-b border-slate-100">
        {(['PRESENT','ABSENT','WEEK_OFF'] as CalendarDayStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={clsx('w-2.5 h-2.5 rounded-full', STATUS_DOT[s])} />
            {s === 'WEEK_OFF' ? 'Week Off' : s === 'HALF_DAY' ? 'Half Day' : s.charAt(0) + s.slice(1).toLowerCase().replace('_',' ')}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          Holiday
        </span>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 text-center">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={clsx(
              'text-xs font-bold pb-1',
              i === 0 ? 'text-slate-500' : i === 6 ? 'text-red-400' : 'text-slate-500'
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const key    = toKey(day);
          const status = calendarMap[key];
          const dow    = (startDow + (day - 1)) % 7;
          const isWeekend = dow === 0 || dow === 6;

          return (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <span
                className={clsx(
                  'text-sm font-semibold',
                  isWeekend ? 'text-red-400' : 'text-slate-700'
                )}
              >
                {day}
              </span>
              {status && (
                <span className={clsx('w-1.5 h-1.5 rounded-full', STATUS_DOT[status])} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MonthlyAttendance() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year,  setYear]  = useState(now.getFullYear());
  const [data,  setData]  = useState<MonthlyAttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = async (m: number, y: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMonthlyAttendance(EMPLOYEE_ID, m, y);
      setData(res.data.data);
    } catch {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(month, year); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetData = () => fetchData(month, year);

  const s = data?.stats;

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3">
          <CalendarDays size={28} className="text-indigo-500 mt-0.5" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Month Wise Attendances</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              View and analyze monthly stats alongside attendance calendar
            </p>
          </div>
        </div>

        {/* Month / Year Picker */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={handleGetData}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide shadow-sm transition-colors disabled:opacity-60"
          >
            GET DATA
          </button>
        </div>
      </div>

      {/* ── Error / Loading ───────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
          <div className="w-7 h-7 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Top row: donut + primary stats */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4">
              {/* Donut */}
              <TotalSpentWidget
                workedMin={s!.totalWorkedMin}
                targetMin={s!.targetMinutes}
              />

              {/* 4 primary stat mini-cards */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { label: 'Working Days', value: s!.workingDays,   icon: <BriefcaseBusiness size={18}/>, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Present Days', value: s!.presentDays,   icon: <ClipboardCheck    size={18}/>, color: 'text-emerald-500',bg: 'bg-emerald-50' },
                  { label: 'Absent Days',  value: s!.absentDays,    icon: <UserX             size={18}/>, color: 'text-red-400',    bg: 'bg-red-50' },
                  { label: 'Late In',      value: s!.lateIn,         icon: <LogIn             size={18}/>, color: 'text-amber-500',  bg: 'bg-amber-50' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                      <p className="text-xl font-bold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', item.bg, item.color)}>
                      {item.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat cards grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Week Offs"           value={s!.weekOffs}           icon={<Ban         size={18}/>} accentColor="border-indigo-400" />
              <StatCard label="Holidays"            value={s!.holidays}           icon={<CalendarDays size={18}/>} accentColor="border-emerald-400" />
              <StatCard label="Leaves"              value={s!.leaves}             icon={<Leaf        size={18}/>} accentColor="border-red-400" />
              <StatCard label="Extra Days"          value={s!.extraDays}          icon={<Plus        size={18}/>} accentColor="border-slate-400" />
              <StatCard label="Pending Attendance"  value={s!.pendingAttendance}  icon={<Clock       size={18}/>} accentColor="border-amber-400" />
              <StatCard label="Rejected Attendance" value={s!.rejectedAttendance} icon={<UserRoundX  size={18}/>} accentColor="border-red-400" />
              <StatCard label="Short Leave"         value={s!.shortLeave}         icon={<Timer       size={18}/>} accentColor="border-teal-400" />
              <StatCard label="Early Out"           value={s!.earlyOut}           icon={<ArrowDownRight size={18}/>} accentColor="border-slate-600" />
              <StatCard label="Punch Out Missing"   value={s!.punchOutMissing}    icon={<Clock       size={18}/>} accentColor="border-rose-400" />
            </div>

            {/* Hours cards */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Extra Hours"
                value={minutesToHHMM(s!.extraHoursMin)}
                icon={<ArrowUpRight  size={18}/>}
                accentColor="border-emerald-500"
              />
              <StatCard
                label="Remaining Hours"
                value={minutesToHM(s!.remainingMinutes)}
                icon={<ArrowDownRight size={18}/>}
                accentColor="border-amber-400"
              />
              <StatCard
                label="Leave Hours"
                value={minutesToHMCompact(s!.leaveHoursMin)}
                icon={<Clock         size={18}/>}
                accentColor="border-red-400"
              />
            </div>

            {/* Adjusted hours (full width) */}
            <StatCard
              label="Adjusted Hours (Remaining)"
              value={minutesToHM(s!.adjustedHoursMin)}
              icon={<RotateCcw size={18}/>}
              accentColor="border-indigo-400"
            />
          </div>

          {/* ── RIGHT PANEL: Calendar ─────────────────────────────────────── */}
          <AttendanceCalendar
            month={month}
            year={year}
            daysInMonth={data.daysInMonth}
            calendarMap={data.calendarMap}
          />
        </div>
      )}
    </div>
  );
}
