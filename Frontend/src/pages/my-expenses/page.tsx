import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  Loader2,
  IndianRupee,
} from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../../service/expense.service';
import type { Expense, ExpenseRaw, ExpenseStatus, ExpenseType } from '../../types';
import { useAuth } from '../../context/AuthContext';

// ── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  'Bike11 - petrol',
  'Car - petrol',
  'Food & Meals',
  'Travel - Air',
  'Travel - Bus',
  'Travel - Train',
  'Hotel & Accommodation',
  'Telephone & Internet',
  'Office Supplies',
  'Medical',
  'Other',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatAmount = (val: string | number) =>
  `₹${Number(val).toFixed(2)}`;

const toUiStatus = (raw: ExpenseRaw['status']): ExpenseStatus => {
  const map: Record<ExpenseRaw['status'], ExpenseStatus> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    UNPAID: 'Unpaid',
    REJECTED: 'Rejected',
  };
  return map[raw] ?? 'Pending';
};

const toApiStatus = (ui: ExpenseStatus): ExpenseRaw['status'] => {
  const map: Record<ExpenseStatus, ExpenseRaw['status']> = {
    Pending: 'PENDING',
    Paid: 'PAID',
    Unpaid: 'UNPAID',
    Rejected: 'REJECTED',
  };
  return map[ui];
};

const formatRaw = (r: ExpenseRaw): Expense => ({
  id: r.id,
  status: toUiStatus(r.status),
  multiLevelApproval: r.multiLevelApproval ?? '—',
  expenseId: r.expenseCode,
  title: r.title,
  date: formatDate(r.date),
  siteName: r.siteName,
  amount: formatAmount(r.amount),
  category: r.category,
  type: r.expenseType === 'UNIT_WISE' ? 'Unit Wise' : 'Amount Wise',
  unit: r.unit ?? '—',
  unitRate: r.unitRate != null ? formatAmount(r.unitRate) : '—',
  _raw: r,
});

// ── Empty form factory ────────────────────────────────────────────────────────

const emptyForm = () => ({
  title: '',
  date: '',
  siteName: '',
  amount: '',
  category: EXPENSE_CATEGORIES[0],
  expenseType: 'AMOUNT_WISE' as ExpenseType,
  unit: '',
  unitRate: '',
});

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const cls: Record<ExpenseStatus, string> = {
    Paid: 'bg-emerald-50 text-emerald-600',
    Pending: 'bg-amber-50 text-amber-600',
    Unpaid: 'bg-slate-100 text-slate-600',
    Rejected: 'bg-rose-50 text-rose-600',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls[status]}`}
    >
      {status}
    </span>
  );
}

// ── View Modal ───────────────────────────────────────────────────────────────

interface ViewModalProps {
  expense: Expense;
  onClose: () => void;
}

function ViewModal({ expense, onClose }: ViewModalProps) {
  const fields: { label: string; value: string }[] = [
    { label: 'Expense ID', value: expense.expenseId },
    { label: 'Title', value: expense.title },
    { label: 'Date', value: expense.date },
    { label: 'Site Name', value: expense.siteName },
    { label: 'Amount', value: expense.amount },
    { label: 'Category', value: expense.category },
    { label: 'Type', value: expense.type },
    { label: 'Unit', value: expense.unit },
    { label: 'Unit Rate', value: expense.unitRate },
    { label: 'Multi Level Approval', value: expense.multiLevelApproval },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-indigo-500" strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-slate-800">Expense Details</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={expense.status} />
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm font-medium text-slate-700">{value}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Modal ─────────────────────────────────────────────────────────

interface ExpenseModalProps {
  mode: 'add' | 'edit';
  existing?: Expense;
  employeeId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function ExpenseModal({ mode, existing, employeeId, onClose, onSuccess }: ExpenseModalProps) {
  const raw = existing?._raw;

  const [form, setForm] = useState(() => {
    if (mode === 'edit' && raw) {
      return {
        title: raw.title,
        date: raw.date.split('T')[0],
        siteName: raw.siteName,
        amount: String(Number(raw.amount).toFixed(2)),
        category: raw.category,
        expenseType: raw.expenseType,
        unit: raw.unit ?? '',
        unitRate: raw.unitRate != null ? String(Number(raw.unitRate).toFixed(2)) : '',
      };
    }
    return emptyForm();
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isUnitWise = form.expenseType === 'UNIT_WISE';

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.date || !form.siteName.trim() || !form.amount || !form.category) {
      setError('Please fill in all required fields.');
      return;
    }

    const amountNum = Number(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    if (isUnitWise) {
      if (!form.unit.trim() || !form.unitRate) {
        setError('Unit and Unit Rate are required for Unit Wise expenses.');
        return;
      }
      const rateNum = Number(form.unitRate);
      if (isNaN(rateNum) || rateNum <= 0) {
        setError('Unit Rate must be a positive number.');
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        date: new Date(form.date).toISOString(),
        siteName: form.siteName.trim(),
        amount: amountNum,
        category: form.category,
        expenseType: form.expenseType,
        unit: isUnitWise ? form.unit.trim() : undefined,
        unitRate: isUnitWise && form.unitRate ? Number(form.unitRate) : undefined,
      };

      if (mode === 'add') {
        await createExpense({ ...payload, employeeId: employeeId });
      } else if (mode === 'edit' && existing) {
        await updateExpense(existing.id, payload);
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-indigo-500" strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-slate-800">
              {mode === 'add' ? 'Add Expense' : 'Edit Expense'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Travel expense"
              className={inputCls}
            />
          </div>

          {/* Date + Site */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Site Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => set('siteName', e.target.value)}
                placeholder="e.g. Mumbai"
                className={inputCls}
              />
            </div>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className={inputCls}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.expenseType}
                onChange={(e) => set('expenseType', e.target.value as ExpenseType)}
                className={inputCls}
              >
                <option value="AMOUNT_WISE">Amount Wise</option>
                <option value="UNIT_WISE">Unit Wise</option>
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={inputCls}
            />
          </div>

          {/* Unit fields — shown only for Unit Wise */}
          {isUnitWise && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => set('unit', e.target.value)}
                  placeholder="e.g. km"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Unit Rate (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.unitRate}
                  onChange={(e) => set('unitRate', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1 shrink-0">
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
                  {mode === 'add' ? 'Submitting...' : 'Saving...'}
                </>
              ) : mode === 'add' ? (
                'Submit Expense'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Filter tab config ─────────────────────────────────────────────────────────

interface FilterTab {
  name: ExpenseStatus;
  color: string;
  dot: string;
}

const FILTER_TABS: FilterTab[] = [
  { name: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  { name: 'Unpaid', color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-500' },
  { name: 'Paid', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  { name: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MyExpenses() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [activeFilter, setActiveFilter] = useState<ExpenseStatus>('Pending');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Month/Year filter state
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  // Committed month/year — only applied when user clicks GET
  const [committedMonth, setCommittedMonth] = useState<number>(new Date().getMonth() + 1);
  const [committedYear, setCommittedYear] = useState<number>(new Date().getFullYear());

  // Modal states
  type ModalMode = 'add' | 'edit' | 'view' | null;
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getExpenses(EMPLOYEE_ID, {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: toApiStatus(activeFilter),
        month: committedMonth,
        year: committedYear,
      });
      const { data, pagination: meta, totalAmount: total } = res.data as {
        data: ExpenseRaw[];
        pagination: { total: number; pageIndex: number; pageSize: number };
        totalAmount: number;
      };
      setExpenses(data.map(formatRaw));
      setTotalRecords(meta.total);
      setTotalAmount(total);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, activeFilter, committedMonth, committedYear]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Reset to page 0 when filter changes
  const handleFilterChange = (filter: ExpenseStatus) => {
    setActiveFilter(filter);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Delete expense "${expense.expenseId}"? This cannot be undone.`)) return;
    try {
      await deleteExpense(expense.id);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to delete expense.');
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
          const expense = row.original;
          const isPending = expense.status === 'Pending';
          return (
            <div className="flex items-center gap-3">
              <StatusBadge status={expense.status} />
              <button
                onClick={() => { setSelectedExpense(expense); setModalMode('view'); }}
                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                title="View details"
              >
                <Eye size={16} />
              </button>
              {isPending && (
                <>
                  <button
                    onClick={() => { setSelectedExpense(expense); setModalMode('edit'); }}
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
      { header: 'DATE', accessorKey: 'date' },
      { header: 'SITE NAME', accessorKey: 'siteName' },
      {
        header: 'AMOUNT',
        accessorKey: 'amount',
        cell: ({ row }) => (
          <span className="font-bold text-slate-800">{row.original.amount}</span>
        ),
      },
      { header: 'CATEGORY', accessorKey: 'category' },
      { header: 'TYPE', accessorKey: 'type' },
      { header: 'UNIT', accessorKey: 'unit' },
      { header: 'UNIT RATE', accessorKey: 'unitRate' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize]
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  // ── Top content (filter tabs) ──────────────────────────────────────────────

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
      {/* View Modal */}
      {modalMode === 'view' && selectedExpense && (
        <ViewModal
          expense={selectedExpense}
          onClose={() => { setModalMode(null); setSelectedExpense(null); }}
        />
      )}

      {/* Add / Edit Modal */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <ExpenseModal
          mode={modalMode}
          existing={modalMode === 'edit' ? selectedExpense ?? undefined : undefined}
          employeeId={EMPLOYEE_ID}
          onClose={() => { setModalMode(null); setSelectedExpense(null); }}
          onSuccess={() => {
            setModalMode(null);
            setSelectedExpense(null);
            fetchExpenses();
          }}
        />
      )}

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
            onClick={() => setModalMode('add')}
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

        {/* Table Area */}
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
