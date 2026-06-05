import { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import {
  getAdvanceRequests,
  deleteAdvanceRequest,
} from '../../../service/advance-salary.service';
import type { AdvanceRequest, AdvanceStatus, AdvanceRequestRaw } from '../../../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format date to readable format: "04:12 PM, 08th Sep 2025"
 */
const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  
  return `${time}, ${day.toString().padStart(2, '0')}${getOrdinalSuffix(day)} ${month} ${year}`;
};

/**
 * Get ordinal suffix (st, nd, rd, th)
 */
const getOrdinalSuffix = (day: number): string => {
  if (day % 10 === 1 && day % 100 !== 11) return 'st';
  if (day % 10 === 2 && day % 100 !== 12) return 'nd';
  if (day % 10 === 3 && day % 100 !== 13) return 'rd';
  return 'th';
};

/**
 * Convert API status to UI status
 */
const toUiStatus = (raw: string): AdvanceStatus => {
  if (raw === 'APPROVED') return 'Approved';
  if (raw === 'DECLINED') return 'Declined';
  return 'Pending';
};

/**
 * Format salary month from "2025-08" to "August-2025"
 */
const formatSalaryMonth = (salaryMonth: string): string => {
  const [year, month] = salaryMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  return `${monthName}-${year}`;
};

/**
 * Convert raw API response to UI format
 */
const formatAdvanceRequest = (raw: AdvanceRequestRaw): AdvanceRequest => ({
  id: raw.id,
  status: toUiStatus(raw.status),
  requestedDate: formatDateTime(raw.createdAt),
  salaryMonth: formatSalaryMonth(raw.salaryMonth),
  amount: parseFloat(raw.amount).toFixed(2),
  remark: raw.remark,
  declinedReason: raw.declinedReason || '—',
  resolvedDate: raw.resolvedAt ? formatDateTime(raw.resolvedAt) : '—',
});

export default function ApplyAdvance() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  /**
   * Fetch advance requests from API
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdvanceRequests(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      
      const { data, pagination: meta } = res.data;
      setRequests((data as AdvanceRequestRaw[]).map(formatAdvanceRequest));
      setTotalRecords(meta.total);
    } catch (err) {
      const message = (err as Error).message || 'Failed to fetch advance requests';
      setError(message);
      console.error('Failed to fetch advance requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  /**
   * Fetch requests on mount and when pagination changes
   */
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  /**
   * Handle delete request
   */
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this request? Only pending requests can be deleted.')) {
      return;
    }

    try {
      await deleteAdvanceRequest(id);
      // Refetch the list after deletion
      fetchRequests();
    } catch (err) {
      const message = (err as Error).message || 'Failed to delete request';
      setError(message);
      console.error('Failed to delete request:', err);
    }
  };

  /**
   * Define table columns
   */
  const columns = useMemo<ColumnDef<AdvanceRequest, unknown>[]>(
    () => [
      { header: 'SR. NO', accessorKey: 'id' },
      {
        header: 'ACTION',
        accessorKey: 'action',
        cell: ({ row }) => {
          const status: AdvanceStatus = row.original.status;
          return (
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                ${status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
                ${status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : ''}
                ${status === 'Declined' ? 'bg-rose-50 text-rose-600' : ''}
              `}
              >
                {status}
              </span>
              {status === 'Pending' && (
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="text-rose-500 hover:text-rose-700 transition-colors p-1 rounded"
                  title="Delete pending request"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
      { header: 'REQUESTED DATE', accessorKey: 'requestedDate' },
      {
        header: 'SALARY MONTH',
        accessorKey: 'salaryMonth',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">{row.original.salaryMonth}</span>
        ),
      },
      {
        header: 'AMOUNT',
        accessorKey: 'amount',
        cell: ({ row }) => (
          <span className="font-bold text-slate-800">₹ {row.original.amount}</span>
        ),
      },
      { header: 'REMARK', accessorKey: 'remark' },
      {
        header: 'DECLINED REASON',
        accessorKey: 'declinedReason',
        cell: ({ row }) => (
          <span className="text-slate-400">{row.original.declinedReason}</span>
        ),
      },
      {
        header: 'APPROVED/DECLINED DATE',
        accessorKey: 'resolvedDate',
        cell: ({ row }) => (
          <span className="text-slate-400">{row.original.resolvedDate}</span>
        ),
      },
    ],
    []
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-indigo-500">
              <CreditCard size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Advance Salary Requests</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">
            Submit and track your salary advance request approvals
          </p>
        </div>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm uppercase tracking-wide">
          ADD REQUEST ADVANCE SALARY
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
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
  );
}
