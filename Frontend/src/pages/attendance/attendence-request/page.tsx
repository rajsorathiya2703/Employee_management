import { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardList, Plus, X, Loader2, Trash2 } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import {
  getAttendanceRequests,
  createAttendanceRequest,
  deleteAttendanceRequest,
} from '../../../service/attendance.service';
import type { AttendanceRequest, AttendanceRequestRaw, AttendanceRequestType } from '../../../types';
import { useAuth } from '../../../context/AuthContext';

// ── Constants ────────────────────────────────────────────────────────────────

const EMPLOYEE_ID = 1; // TODO: replace with auth context value


const REQUEST_TYPES: { value: AttendanceRequestType; label: string }[] = [
  { value: 'PUNCH_IN_ADJUSTMENT', label: 'Punch-In Adjustment' },
  { value: 'PUNCH_OUT_ADJUSTMENT', label: 'Punch-Out Adjustment' },
  { value: 'FULL_DAY_PRESENT', label: 'Full Day Present' },
  { value: 'HALF_DAY_PRESENT', label: 'Half Day Present' },
  { value: 'WORK_FROM_HOME', label: 'Work From Home' },
  { value: 'OTHER', label: 'Other' },
];

const TYPE_LABEL: Record<AttendanceRequestType, string> = Object.fromEntries(
  REQUEST_TYPES.map(({ value, label }) => [value, label])
) as Record<AttendanceRequestType, string>;

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

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
  if (status === 'Approved') {
    return (
      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
        Approved
      </span>
    );
  }
  if (status === 'Declined') {
    return (
      <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-semibold">
        Declined
      </span>
    );
  }
  return (
    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold">
      Pending
    </span>
  );
}

// ── New Request Modal ────────────────────────────────────────────────────────

interface NewRequestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function NewRequestModal({ onClose, onSuccess }: NewRequestModalProps) {
  const [form, setForm] = useState({
    date: '',
    type: REQUEST_TYPES[0].value as AttendanceRequestType,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.date || !form.reason.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setSubmitting(true);
      await createAttendanceRequest({
        employeeId: EMPLOYEE_ID,
        date: new Date(form.date).toISOString(),
        type: form.type,
        reason: form.reason.trim(),
      });
      onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <ClipboardList size={20} className="text-indigo-500" strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-slate-800">New Attendance Request</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Request Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as AttendanceRequestType }))
              }
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            >
              {REQUEST_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              rows={3}
              placeholder="Describe the reason for your request..."
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AttendanceRequests() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await deleteAttendanceRequest(id);
      fetchRequests();
    } catch (err) {
      console.error('Failed to delete request:', err);
    }
  };

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
          <span className="text-slate-600 max-w-xs block truncate" title={info.getValue() as string}>
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

  return (
    <>
      {showModal && (
        <NewRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchRequests();
          }}
        />
      )}

      <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="text-slate-800" size={28} strokeWidth={2.5} />
              <h1 className="text-2xl font-bold text-slate-800">Attendance Requests</h1>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">Submit and view attendance adjustments</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Request
          </button>
        </div>

        {/* Table Area */}
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
