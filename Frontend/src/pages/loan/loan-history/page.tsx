import { useState, useEffect, useCallback, useMemo } from 'react';
import { DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import { formatLoanRequest } from '../apply-loan/[id]/page';
import { getLoanRequests } from '../../../service/loan.service';
import type { LoanRequest, LoanStatus, LoanRequestRaw } from '../../../types';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoanHistory() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [requests, setRequests]       = useState<LoanRequest[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading]           = useState(false);
  const [pageError, setPageError]       = useState<string | null>(null);

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
      setPageError((err as Error).message || 'Failed to fetch loan history');
      console.error('Failed to fetch loan history:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, EMPLOYEE_ID]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<LoanRequest, unknown>[]>(
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
        header: 'STATUS',
        id: 'status',
        cell: ({ row }) => {
          const status: LoanStatus = row.original.status;
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-block
                ${status === 'Pending'    ? 'bg-amber-50 text-amber-600'   : ''}
                ${status === 'Approved'   ? 'bg-emerald-50 text-emerald-600' : ''}
                ${status === 'Rejected'   ? 'bg-rose-50 text-rose-600'     : ''}
                ${status === 'Disbursed'  ? 'bg-blue-50 text-blue-600'     : ''}
                ${status === 'Repaid'     ? 'bg-slate-50 text-slate-600'   : ''}
              `}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: 'LOAN AMOUNT',
        id: 'loanAmount',
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
        header: 'APPROVED AMOUNT',
        id: 'approvedAmount',
        cell: ({ row }) => (
          <span className="text-slate-700 font-medium">
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
        header: 'REPAYMENT PERIOD',
        id: 'repaymentPeriod',
        cell: ({ row }) => (
          <span className="text-slate-700">
            {row.original.repaymentPeriod} months
          </span>
        ),
      },
      {
        header: 'REQUESTED DATE',
        id: 'requestedDate',
        cell: ({ row }) => (
          <span className="text-slate-600 text-sm">
            {row.original.requestedDate}
          </span>
        ),
      },
      {
        header: 'APPROVED DATE',
        id: 'approvedDate',
        cell: ({ row }) => (
          <span className="text-slate-600 text-sm">
            {row.original.approvedDate === '—' ? '—' : row.original.approvedDate}
          </span>
        ),
      },
      {
        header: 'DISBURSED DATE',
        id: 'disbursedDate',
        cell: ({ row }) => (
          <span className="text-slate-600 text-sm">
            {row.original.disbursedDate === '—' ? '—' : row.original.disbursedDate}
          </span>
        ),
      },
      {
        header: 'REPAID DATE',
        id: 'repaidDate',
        cell: ({ row }) => (
          <span className="text-slate-600 text-sm">
            {row.original.repaidDate === '—' ? '—' : row.original.repaidDate}
          </span>
        ),
      },
      {
        header: 'REASON',
        id: 'reason',
        cell: ({ row }) => (
          <span className="text-slate-700 max-w-xs truncate" title={row.original.reason}>
            {row.original.reason}
          </span>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  // ── Page ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Clock size={24} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Loan History</h1>
          <p className="text-sm text-slate-500">View all your loan requests and their status</p>
        </div>
      </div>

      {pageError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      <AdvancedDataTable
        columns={columns}
        data={requests}
        loading={loading}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRecords={totalRecords}
        noDataMessage="No loan records found."
      />
    </div>
  );
}
