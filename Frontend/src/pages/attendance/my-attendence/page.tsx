import { useState, useEffect } from 'react';
import { ClipboardList, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import DetailSessionLogCard from '../../../component/common/DetailSessionLogCard';
import {
  getMyAttendance,
  getSessionsByAttendanceId,
} from '../../../service/attendance.service';
import type { FormattedAttendance, AttendanceSession } from '../../../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const EMPLOYEE_ID = 1; // replace with auth context later

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatWorkingHours(totalMinutes: number) {
  // Show HH:MM:SS using actual seconds via totalMinutes * 60 approximation
  // Backend stores totalMinutes; display as HH:MM:00
  const hrs  = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
}

// Total columns count — keep in sync with the columns array below
const TOTAL_COLUMNS = 6;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyAttendance() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [attendanceData, setAttendanceData]   = useState<FormattedAttendance[]>([]);
  const [loading, setLoading]                 = useState(false);

  // expandedRowId → sessions array (null while loading, [] if none)
  const [expandedId, setExpandedId]           = useState<number | null>(null);
  const [sessionMap, setSessionMap]           = useState<Record<number, AttendanceSession[]>>({});
  const [sessionLoading, setSessionLoading]   = useState<number | null>(null);

  // ── fetch attendance list ──────────────────────────────────────────────────
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getMyAttendance(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize:  pagination.pageSize,
      });

      const raw: {
        id: number;
        attendanceDate: string;
        firstPunchIn: string | null;
        lastPunchOut: string | null;
        totalMinutes: number;
        status: string;
      }[] = res.data.data;

      const formattedData: FormattedAttendance[] = raw.map((a, index) => ({
        id:           index + 1,
        attendanceId: a.id,
        date:         formatDate(a.attendanceDate),
        punchIn:      formatTime(a.firstPunchIn),
        punchOut:     formatTime(a.lastPunchOut),
        workingHours: formatWorkingHours(a.totalMinutes),
        totalMinutes: a.totalMinutes,
        status:       a.status === 'PRESENT' ? 'Present' : a.status,
      }));

      setAttendanceData(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize]);

  // ── expand / collapse a row ────────────────────────────────────────────────
  const handleExpand = async (row: FormattedAttendance) => {
    const { id, attendanceId } = row;

    // Collapse if already open
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);

    // Fetch sessions only once per attendanceId
    if (sessionMap[id] !== undefined) return;

    setSessionLoading(id);
    try {
      const res = await getSessionsByAttendanceId(attendanceId);
      setSessionMap((prev) => ({ ...prev, [id]: res.data.data }));
    } catch {
      setSessionMap((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setSessionLoading(null);
    }
  };

  // ── columns ───────────────────────────────────────────────────────────────
  const columns: ColumnDef<FormattedAttendance, unknown>[] = [
    {
      id:     'expand',
      header: '',
      cell:   ({ row }) => {
        const isExpanded = expandedId === row.original.id;
        const isThisLoading = sessionLoading === row.original.id;
        return (
          <button
            onClick={() => handleExpand(row.original)}
            className="text-slate-400 hover:text-indigo-500 transition-colors"
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
          >
            {isThisLoading ? (
              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
            ) : isExpanded ? (
              <ChevronDown size={18} className="text-indigo-500" />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        );
      },
    },
    {
      header:      'DATE',
      accessorKey: 'date',
      cell:        ({ row }) => (
        <span className="font-semibold text-slate-700">{row.original.date}</span>
      ),
    },
    { header: 'PUNCH IN',      accessorKey: 'punchIn' },
    { header: 'PUNCH OUT',     accessorKey: 'punchOut' },
    { header: 'WORKING HOURS', accessorKey: 'workingHours' },
    {
      header:      'STATUS',
      accessorKey: 'status',
      cell:        ({ row }) => (
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
          {row.original.status}
        </span>
      ),
    },
  ];

  // ── expanded row renderer (passed to AdvancedDataTable) ───────────────────
  const expandedRowContent = (row: FormattedAttendance) => {
    if (expandedId !== row.id) return null;

    const sessions = sessionMap[row.id];

    if (!sessions) {
      // Still loading — show a slim skeleton row
      return (
        <tr key={`expand-loading-${row.id}`}>
          <td colSpan={TOTAL_COLUMNS} className="px-8 pb-3 pt-0 bg-white">
            <div className="h-10 flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
              Loading sessions…
            </div>
          </td>
        </tr>
      );
    }

    return (
      <DetailSessionLogCard
        key={`expand-${row.id}`}
        sessions={sessions}
        totalMinutes={row.totalMinutes}
        colSpan={TOTAL_COLUMNS}
      />
    );
  };

  // ── topContent (month picker) ─────────────────────────────────────────────
  const topContent = (
    <div className="relative">
      <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-indigo-500 transition-colors cursor-pointer group">
        <span className="text-sm font-medium text-slate-700 mr-8">June, 2026</span>
        <Calendar
          size={16}
          className="text-slate-400 group-hover:text-indigo-500 transition-colors"
        />
      </div>
      <input
        type="month"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        defaultValue="2026-06"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-slate-800">
              <ClipboardList size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">View your attendance records</p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          title="Attendance Records"
          topContent={topContent}
          columns={columns}
          data={attendanceData}
          totalRecords={attendanceData.length}
          pageCount={Math.ceil(attendanceData.length / pagination.pageSize)}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={loading}
          expandedRowContent={expandedRowContent}
        />
      </div>
    </div>
  );
}
