import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutGrid,
  Calendar,
  Box,
  ListChecks,
  MapPin,
  FileText,
  Leaf,
  ReceiptText,
  TriangleAlert,
  Play,
} from 'lucide-react';
import DashboardCard from '../component/common/DashboardCard';
import {
  punchIn as apiPunchIn,
  punchOut as apiPunchOut,
  getTodaySessions,
} from '../service/attendance.service';
import { useAuth } from '../context/AuthContext';
import { getMonthlyVisitCount } from '../service/visit.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceSession {
  id: number;
  punchIn: string;
  punchOut: string | null;
  durationMinute: number;
}

interface TodaySessionsData {
  isPunchedIn: boolean;
  activePunchIn: string | null;
  sessions: AttendanceSession[];
  totalMinutes: number;
}

// Hard-coded until auth is wired up — now using AuthContext
const EMPLOYEE_ID_FALLBACK = 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function minutesToHours(minutes: number) {
  return (minutes / 60).toFixed(2) + 'h';
}

// ─── PunchInCard ─────────────────────────────────────────────────────────────

function PunchInCard() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? EMPLOYEE_ID_FALLBACK;
  const [isPunchedIn, setIsPunchedIn]   = useState(false);
  const [seconds, setSeconds]           = useState(0);
  const [sessions, setSessions]         = useState<AttendanceSession[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── fetch today's state from backend ───────────────────────────────────────
  const fetchToday = useCallback(async () => {
    try {
      const res = await getTodaySessions(EMPLOYEE_ID);
      const data: TodaySessionsData = res.data.data;

      setSessions(data.sessions);
      setIsPunchedIn(data.isPunchedIn);

      if (data.isPunchedIn && data.activePunchIn) {
        const elapsed = Math.floor(
          (Date.now() - new Date(data.activePunchIn).getTime()) / 1000
        );
        setSeconds(elapsed);
      } else {
        setSeconds(0);
      }
    } catch {
      // Backend not reachable — stay in UI-only mode
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  // ── tick ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPunchedIn) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPunchedIn]);

  // ── punch in / punch out ───────────────────────────────────────────────────
  const handlePunch = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isPunchedIn) {
        await apiPunchOut(EMPLOYEE_ID);
      } else {
        await apiPunchIn(EMPLOYEE_ID);
      }
      await fetchToday();
    } catch (err: unknown) {
      // Extract the error message returned by the backend
      let msg = 'Something went wrong. Please try again.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
      ) {
        msg = (err as { response: { data: { message: string } } }).response.data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hh = pad(Math.floor(seconds / 3600));
  const mm = pad(Math.floor((seconds % 3600) / 60));
  const ss = pad(seconds % 60);

  const buttonLabel = loading
    ? 'Please wait…'
    : isPunchedIn
    ? 'Punch Out'
    : sessions.length > 0
    ? 'Punch In Again'
    : 'Punch In';

  return (
    <div className="bg-[#1a2236] rounded-2xl p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold text-sm tracking-wide">
          Punch In Status
        </span>
        <span
          className={`w-3 h-3 rounded-full ${
            isPunchedIn ? 'bg-emerald-400' : 'bg-red-500'
          }`}
        />
      </div>

      {/* Clock circle */}
      <div className="flex items-center justify-center">
        <div className="w-[140px] h-[140px] rounded-full border-[3px] border-slate-600 flex items-center justify-center">
          <div className="w-[114px] h-[114px] rounded-full border-[2px] border-slate-700 flex items-center justify-center">
            <span className="text-white font-mono text-[22px] font-bold tracking-widest select-none">
              {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-xs text-center font-medium px-2 -mt-1">
          ⚠ {error}
        </p>
      )}

      {/* Punch button */}
      <div className="flex justify-center">
        <button
          onClick={handlePunch}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
            isPunchedIn
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <Play size={13} fill="currentColor" strokeWidth={0} />
          {buttonLabel}
        </button>
      </div>

      {/* Sessions list */}
      {sessions.length > 0 && (
        <>
          <hr className="border-slate-700 mt-1" />
          <div className="flex flex-col gap-2">
            <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-0.5">
              Today's Sessions
            </span>
            {sessions.map((session, i) => {
              const inTime  = formatTime(session.punchIn);
              const outTime = session.punchOut ? formatTime(session.punchOut) : 'Active';
              const dur     = session.punchOut
                ? minutesToHours(session.durationMinute)
                : '…';

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-300">
                    Session {i + 1}:&nbsp;
                    <span className="text-white font-medium">{inTime}</span>
                    &nbsp;–&nbsp;
                    <span
                      className={
                        session.punchOut
                          ? 'text-white font-medium'
                          : 'text-emerald-400 font-medium'
                      }
                    >
                      {outTime}
                    </span>
                  </span>
                  <span className="text-slate-400 font-mono text-xs">{dur}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const EMPLOYEE_ID = user?.id ?? 1;

  const [thisMonthVisit, setThisMonthVisit] = useState(0);

  useEffect(() => {
    getMonthlyVisitCount(EMPLOYEE_ID)
      .then((res) => setThisMonthVisit(res.data?.data?.count ?? 0))
      .catch(() => setThisMonthVisit(0));
  }, [EMPLOYEE_ID]);

  const stats = {
    holidays: 0,
    assets: 0,
    task: 0,
    thisMonthVisit,
    circular: 0,
    thisMonthLeaves: 0,
    thisMonthExpense: '0.00',
    penalty: 0,
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      {/* Page heading */}
      <div className="flex items-center gap-3 shrink-0">
        <LayoutGrid size={28} className="text-slate-700" strokeWidth={2} />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {firstName}!</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here's your workspace overview for today.
          </p>
        </div>
      </div>

      {/* Row 1: Punch-in card + Holidays + Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <PunchInCard />

        <DashboardCard
          title="Holidays"
          value={stats.holidays}
          icon={<Calendar size={18} />}
          color="blue"
        />

        <DashboardCard
          title="Assets"
          value={stats.assets}
          icon={<Box size={18} />}
          color="green"
        />
      </div>

      {/* Row 2: Task, This Month Visit, Circular */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <DashboardCard
          title="Task"
          value={stats.task}
          icon={<ListChecks size={18} />}
          color="indigo"
        />
        <DashboardCard
          title="This Month Visit"
          value={stats.thisMonthVisit}
          icon={<MapPin size={18} />}
          color="yellow"
        />
        <DashboardCard
          title="Circular"
          value={stats.circular}
          icon={<FileText size={18} />}
          color="teal"
        />
      </div>

      {/* Row 3: This Month Leaves, This Month Expense, Penalty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 shrink-0">
        <DashboardCard
          title="This Month Leaves"
          value={stats.thisMonthLeaves}
          icon={<Leaf size={18} />}
          color="green"
        />
        <DashboardCard
          title="This Month Expense"
          value={stats.thisMonthExpense}
          icon={<ReceiptText size={18} />}
          color="orange"
        />
        <DashboardCard
          title="Penalty"
          value={stats.penalty}
          icon={<TriangleAlert size={18} />}
          color="red"
        />
      </div>

    </div>
  );
}
