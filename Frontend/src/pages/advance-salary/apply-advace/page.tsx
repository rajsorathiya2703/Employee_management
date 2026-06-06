import { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import AdvanceSalaryDialog, { formatAdvanceRequest } from './[id]/page';
import {
  getAdvanceRequests,
  deleteAdvanceRequest,
} from '../../../service/advance-salary.service';
import type { AdvanceRequest, AdvanceStatus, AdvanceRequestRaw } from '../../../types';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApplyAdvance() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [requests, setRequests]       = useState<AdvanceRequest[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading]           = useState(false);
  const [pageError, setPageError]       = useState<string | null>(null);
  const [showDialog, setShowDialog]     = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const res = await getAdvanceRequests(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize:  pagination.pageSize,
      });
      const { data, pagination: meta } = res.data;
      setRequests((data as AdvanceRequestRaw[]).map(formatAdvanceRequest));
      setTotalRecords(meta.total);
    } catch (err) {
      setPageError((err as Error).message || 'Failed to fetch advance requests');
      console.error('Failed to fetch advance requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, EMPLOYEE_ID]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Optimistic insert ────────────────────────────────────────────────────

  const handleCreated = (newRequest: AdvanceRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setTotalRecords((prev) => prev + 1);
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this request? Only pending requests can be deleted.'))
      return;
    try {
      await deleteAdvanceRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setPageError((err as Error).message || 'Failed to delete request');
      console.error('Failed to delete request:', err);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<AdvanceRequest, unknown>[]>(
    () => [
      {
        header: 'SR. NO',
        id: 'serialNo',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
      },
      {
        header: 'ACTION',
        id: 'action',
        cell: ({ row }) => {
          const status: AdvanceStatus = row.original.status;
          return (
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                  ${status === 'Pending'  ? 'bg-amber-50 text-amber-600'   : ''}
                  ${status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${status === 'Declined' ? 'bg-rose-50 text-rose-600'     : ''}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize]
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Add Request Dialog */}
      <AdvanceSalaryDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        employeeId={EMPLOYEE_ID}
        onCreated={handleCreated}
      />

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
          <button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm uppercase tracking-wide"
          >
            <Plus size={18} strokeWidth={2.5} />
            ADD REQUEST
          </button>
        </div>

        {/* Error banner */}
        {pageError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm shrink-0">
            {pageError}
          </div>
        )}

        {/* Table */}
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
    </>
  );
}
