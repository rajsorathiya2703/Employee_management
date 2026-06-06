import { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';
import ExpenseDialog, {
  StatusBadge,
  formatRawExpense,
  type ExpenseDialogMode,
} from './[id]/page';
import { getExpenses, deleteExpense } from '../../service/expense.service';
import type { Expense, ExpenseRaw, ExpenseStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

const toApiStatus = (ui: ExpenseStatus): ExpenseRaw['status'] => {
  const map: Record<ExpenseStatus, ExpenseRaw['status']> = {
    Pending:  'PENDING',
    Paid:     'PAID',
    Unpaid:   'UNPAID',
    Rejected: 'REJECTED',
  };
  return map[ui];
};

// ── Filter tab config ─────────────────────────────────────────────────────────

interface FilterTab {
  name: ExpenseStatus;
  color: string;
  dot: string;
}

const FILTER_TABS: FilterTab[] = [
  { name: 'Pending',  color: 'text-amber-600 bg-amber-50 border-amber-200',     dot: 'bg-amber-500' },
  { name: 'Unpaid',   color: 'text-slate-600 bg-slate-50 border-slate-200',     dot: 'bg-slate-500' },
  { name: 'Paid',     color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  { name: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200',        dot: 'bg-rose-500' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyExpenses() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [expenses, setExpenses]       = useState<Expense[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalAmount, setTotalAmount]  = useState(0);
  const [loading, setLoading]          = useState(false);

  const [activeFilter, setActiveFilter] = useState<ExpenseStatus>('Pending');
  const [pagination, setPagination]     = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Month / Year filter
  const [month, setMonth]                   = useState(new Date().getMonth() + 1);
  const [year, setYear]                     = useState(new Date().getFullYear());
  const [committedMonth, setCommittedMonth] = useState(new Date().getMonth() + 1);
  const [committedYear, setCommittedYear]   = useState(new Date().getFullYear());

  // Dialog state
  const [dialogMode, setDialogMode]         = useState<ExpenseDialogMode>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpenses(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize:  pagination.pageSize,
        status:    toApiStatus(activeFilter),
        month:     committedMonth,
        year:      committedYear,
      });
      const {
        data,
        pagination: meta,
        totalAmount: total,
      } = res.data as {
        data: ExpenseRaw[];
        pagination: { total: number; pageIndex: number; pageSize: number };
        totalAmount: number;
      };
      setExpenses(data.map(formatRawExpense));
      setTotalRecords(meta.total);
      setTotalAmount(total);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, activeFilter, committedMonth, committedYear, EMPLOYEE_ID]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // ── Optimistic handlers ────────────────────────────────────────────────────

  const handleCreated = (expense: Expense) => {
    // Only show in the table if the active filter matches Pending (new expenses are always Pending)
    if (activeFilter === 'Pending') {
      setExpenses((prev) => [expense, ...prev]);
      setTotalRecords((prev) => prev + 1);
    }
    setTotalAmount((prev) => prev + Number(expense.amount.replace('₹', '').trim()));
    setDialogMode(null);
    setSelectedExpense(null);
  };

  const handleUpdated = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setDialogMode(null);
    setSelectedExpense(null);
  };

  const handleFilterChange = (filter: ExpenseStatus) => {
    setActiveFilter(filter);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete expense "${expense.expenseId}"? This cannot be undone.`)) return;
    try {
      await deleteExpense(expense.id);
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
      setTotalAmount((prev) => Math.max(0, prev - Number(expense.amount.replace('₹', '').trim())));
    } catch (err) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to delete expense.'
      );
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<Expense, unknown>[]>(
    () => [
      {
        id: 'serialNo',
        header: 'SR. NO',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
      },
      {
        id: 'action',
        header: 'ACTION',
        cell: ({ row }) => {
          const expense   = row.original;
          const isPending = expense.status === 'Pending';
          return (
            <div className="flex items-center gap-3">
              <StatusBadge status={expense.status} />
              <button
                onClick={() => { setSelectedExpense(expense); setDialogMode('view'); }}
                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                title="View details"
              >
                <Eye size={16} />
              </button>
              {isPending && (
                <>
                  <button
                    onClick={() => { setSelectedExpense(expense); setDialogMode('edit'); }}
                    className="text-amber-500 hover:text-amber-700 transition-colors"
                    title="Edit expense"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(expense)}
                    className="text-rose-500 hover:text-rose-700 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
      { header: 'MULTI LEVEL APPROVAL', accessorKey: 'multiLevelApproval' },
      {
        header: 'EXPENSE ID',
        accessorKey: 'expenseId',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-700">{row.original.expenseId}</span>
        ),
      },
      {
        header: 'TITLE',
        accessorKey: 'title',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">{row.original.title}</span>
        ),
      },
      { header: 'DATE',      accessorKey: 'date' },
      { header: 'SITE NAME', accessorKey: 'siteName' },
      {
        header: 'AMOUNT',
        accessorKey: 'amount',
        cell: ({ row }) => (
          <span className="font-bold text-slate-800">{row.original.amount}</span>
        ),
      },
      { header: 'CATEGORY',  accessorKey: 'category' },
      { header: 'TYPE',      accessorKey: 'type' },
      { header: 'UNIT',      accessorKey: 'unit' },
      { header: 'UNIT RATE', accessorKey: 'unitRate' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize]
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  // ── Top content ────────────────────────────────────────────────────────────

  const topContent = (
    <div className="flex items-center gap-2 flex-wrap">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.name}
          onClick={() => handleFilterChange(tab.name)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
            activeFilter === tab.name
              ? 'ring-2 ring-indigo-500 ring-offset-1 opacity-100'
              : 'opacity-70 hover:opacity-100'
          } ${tab.color}`}
        >
          <div className={`w-2 h-2 rounded-full ${tab.dot}`} />
          {tab.name}
        </button>
      ))}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Expense Dialog — handles add / edit / view */}
      <ExpenseDialog
        mode={dialogMode}
        existing={selectedExpense}
        employeeId={EMPLOYEE_ID}
        onClose={() => { setDialogMode(null); setSelectedExpense(null); }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                <Receipt size={24} strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">My Expenses</h1>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Track, filter and manage your submitted reimbursement claims
            </p>
          </div>
          <button
            onClick={() => setDialogMode('add')}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            ADD EXPENSE
          </button>
        </div>

        {/* Summary Banner */}
        <div className="bg-indigo-500 text-white rounded-xl px-6 py-4 flex items-center shadow-sm shrink-0">
          <h2 className="text-lg font-semibold tracking-wide">
            Total Amount : ₹ {totalAmount.toFixed(2)}
          </h2>
        </div>

        {/* Month / Year Filter */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            {[
              'January','February','March','April','May','June',
              'July','August','September','October','November','December',
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setCommittedMonth(month);
              setCommittedYear(year);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors"
          >
            GET
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-[520px]">
          <AdvancedDataTable
            topContent={topContent}
            columns={columns}
            data={expenses}
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
