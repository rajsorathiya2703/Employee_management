import { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import NewAttendanceRequestDialog from './[id]/page';
import {
  getAttendanceRequests,
  deleteAttendanceRequest,
} from '../../../service/attendance.service';
import type { AttendanceRequest, AttendanceRequestRaw, AttendanceRequestType } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

// ── Constants ────────────────────────────────────────────────────────────────

const REQUEST_TYPES: { value: AttendanceRequestType; label: string }[] = [
  { value: 'PUNCH_IN_ADJUSTMENT',  label: 'Punch-In Adjustment' },
  { value: 'PUNCH_OUT_ADJUSTMENT', label: 'Punch-Out Adjustment' },
  { value: 'FULL_DAY_PRESENT',     label: 'Full Day Present' },
  { value: 'HALF_DAY_PRESENT',     label: 'Half Day Present' },
  { value: 'WORK_FROM_HOME',       label: 'Work From Home' },
  { value: 'OTHER',                label: 'Other' },
];

const TYPE_LABEL: Record<AttendanceRequestType, string> = Object.fromEntries(
  REQUEST_TYPES.map(({ value, label }) => [value, label])
) as Record<AttendanceRequestType, string>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const toUiStatus = (raw: string): AttendanceRequest['status'] => {
  if (raw === 'APPROVED') return 'Approved';
  if (raw === 'DECLINED') return 'Declined';
  return 'Pending';
};

const formatRaw = (r: AttendanceRequestRaw): AttendanceRequest => ({
  id: r.id,
  date: formatDate(r.date),
  type: TYPE_LABEL[r.type] ?? r.type,
  reason: r.reason,
  status: toUiStatus(r.status),
});

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AttendanceRequest['status'] }) {
  if (status === 'Approved')
    return (
      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
        Approved
      </span>
    );
  if (status === 'Declined')
    return (
      <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-semibold">
        Declined
      </span>
    );
  return (
    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold">
      Pending
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AttendanceRequests() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAttendanceRequests(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      const { data, pagination: meta } = res.data;
      setRequests((data as AttendanceRequestRaw[]).map(formatRaw));
      setTotalRecords(meta.total);
    } catch (err) {
      console.error('Failed to fetch attendance requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, EMPLOYEE_ID]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Optimistic insert ──────────────────────────────────────────────────────

  const handleRequestCreated = (newRequest: AttendanceRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setTotalRecords((prev) => prev + 1);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await deleteAttendanceRequest(id);
      // Remove from local state immediately
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<AttendanceRequest, unknown>[]>(
    () => [
      {
        id: 'serialNo',
        header: '#',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
      },
      { header: 'DATE', accessorKey: 'date' },
      { header: 'TYPE', accessorKey: 'type' },
      {
        header: 'REASON',
        accessorKey: 'reason',
        cell: (info) => (
          <span
            className="text-slate-600 max-w-xs block truncate"
            title={info.getValue() as string}
          >
            {info.getValue() as string}
          </span>
        ),
      },
      {
        header: 'STATUS',
        accessorKey: 'status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) =>
          row.original.status === 'Pending' ? (
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
              title="Delete request"
            >
              <Trash2 size={16} />
            </button>
          ) : null,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize]
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* New Request Dialog */}
      <NewAttendanceRequestDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        employeeId={EMPLOYEE_ID}
        onCreated={handleRequestCreated}
      />

      <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="text-slate-800" size={28} strokeWidth={2.5} />
              <h1 className="text-2xl font-bold text-slate-800">Attendance Requests</h1>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Submit and view attendance adjustments
            </p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Request
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-[520px]">
          <AdvancedDataTable
            title="Request History"
            columns={columns}
            data={requests}
            totalRecords={totalRecords}
            pageCount={pageCount}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}
