import { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import LoanDialog, { formatLoanRequest } from './[id]/page';
import {
  getLoanRequests,
  deleteLoanRequest,
} from '../../../service/loan.service';
import type { LoanRequest, LoanStatus, LoanRequestRaw } from '../../../types';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApplyLoan() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [requests, setRequests]       = useState<LoanRequest[]>([]);
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
      const res = await getLoanRequests(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize:  pagination.pageSize,
      });
      const { data, pagination: meta } = res.data;
      setRequests((data as LoanRequestRaw[]).map(formatLoanRequest));
      setTotalRecords(meta.total);
    } catch (err) {
      setPageError((err as Error).message || 'Failed to fetch loan requests');
      console.error('Failed to fetch loan requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, EMPLOYEE_ID]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Optimistic insert ────────────────────────────────────────────────────

  const handleCreated = (newRequest: LoanRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
    setTotalRecords((prev) => prev + 1);
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this request? Only pending requests can be deleted.'))
      return;
    try {
      await deleteLoanRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setPageError((err as Error).message || 'Failed to delete request');
      console.error('Failed to delete request:', err);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<LoanRequest, unknown>[]>(
    () => [
      {
        header: 'SR. NO',
        id: 'serialNo',
        accessorKey: 'id',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
      },
      {
        header: 'ACTION',
        id: 'action',
        accessorKey: 'id',
        cell: ({ row }) => {
          const status: LoanStatus = row.original.status;
          return (
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                  ${status === 'Pending'    ? 'bg-amber-50 text-amber-600'   : ''}
                  ${status === 'Approved'   ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${status === 'Rejected'   ? 'bg-rose-50 text-rose-600'     : ''}
                  ${status === 'Disbursed'  ? 'bg-blue-50 text-blue-600'     : ''}
                  ${status === 'Repaid'     ? 'bg-slate-50 text-slate-600'   : ''}
                `}
              >
                {status}
              </span>
              {status === 'Pending' && (
                <button
                  onClick={() => handleDelete(row.original.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Delete request"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
      {
        header: 'LOAN AMOUNT',
        accessorKey: 'loanAmount',
        cell: ({ row }) => (
          <span className="text-slate-700 font-medium">
            ₹{parseFloat(row.original.loanAmount).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        header: 'REPAYMENT PERIOD',
        accessorKey: 'repaymentPeriod',
        cell: ({ row }) => (
          <span className="text-slate-700">
            {row.original.repaymentPeriod} months
          </span>
        ),
      },
      {
        header: 'REASON',
        accessorKey: 'reason',
        cell: ({ row }) => (
          <span className="text-slate-700 max-w-xs truncate">
            {row.original.reason}
          </span>
        ),
      },
      {
        header: 'APPROVED AMOUNT',
        accessorKey: 'approvedAmount',
        cell: ({ row }) => (
          <span className="text-slate-700">
            {row.original.approvedAmount === '—'
              ? '—'
              : `₹${parseFloat(row.original.approvedAmount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </span>
        ),
      },
      {
        header: 'REQUESTED DATE',
        accessorKey: 'requestedDate',
        cell: ({ row }) => (
          <span className="text-slate-600 text-sm">
            {row.original.requestedDate}
          </span>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  // ── Page ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <DollarSign size={24} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Loan</h1>
            <p className="text-sm text-slate-500">Apply for and track your loans</p>
          </div>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          Apply for Loan
        </button>
      </div>

      {pageError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      <AdvancedDataTable
        columns={columns as any}
        data={requests}
        isLoading={loading}
        pagination={pagination}
        setPagination={setPagination}
        totalRecords={totalRecords}
        pageCount={Math.ceil(totalRecords / pagination.pageSize) || 1}
        emptyMessage="No loan records found. Apply for a loan to get started."
      />

      <LoanDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        employeeId={EMPLOYEE_ID}
        onCreated={handleCreated}
      />
    </div>
  );
}
