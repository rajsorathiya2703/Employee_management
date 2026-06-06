import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IndianRupee, Receipt, Loader2 } from 'lucide-react';
import DetailDialog from '../../../component/common/DetailDialog';
import TextInput from '../../../component/common/TextInput';
import Dropdown from '../../../component/common/Dropdown';
import DatePicker from '../../../component/common/DatePicker';
import { createExpense, updateExpense } from '../../../service/expense.service';
import type { Expense, ExpenseRaw, ExpenseStatus, ExpenseType } from '../../../types';

// ── Constants ─────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
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

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ label: c, value: c }));

const EXPENSE_TYPE_OPTIONS = [
  { label: 'Amount Wise', value: 'AMOUNT_WISE' },
  { label: 'Unit Wise', value: 'UNIT_WISE' },
];

const TODAY = new Date().toISOString().split('T')[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatAmount = (val: string | number) => `₹${Number(val).toFixed(2)}`;

const toUiStatus = (raw: ExpenseRaw['status']): ExpenseStatus => {
  const map: Record<ExpenseRaw['status'], ExpenseStatus> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    UNPAID: 'Unpaid',
    REJECTED: 'Rejected',
  };
  return map[raw] ?? 'Pending';
};

export const formatRawExpense = (r: ExpenseRaw): Expense => ({
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

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: ExpenseStatus }) {
  const cls: Record<ExpenseStatus, string> = {
    Paid:     'bg-emerald-50 text-emerald-600',
    Pending:  'bg-amber-50 text-amber-600',
    Unpaid:   'bg-slate-100 text-slate-600',
    Rejected: 'bg-rose-50 text-rose-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls[status]}`}>
      {status}
    </span>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExpenseForm {
  title: string;
  date: string;
  siteName: string;
  amount: string;
  category: string;
  expenseType: ExpenseType;
  unit: string;
  unitRate: string;
}

export type ExpenseDialogMode = 'add' | 'edit' | 'view' | null;

export interface ExpenseDialogProps {
  mode: ExpenseDialogMode;
  existing?: Expense | null;
  employeeId: number;
  onClose: () => void;
  /** add: called with the new Expense row; edit: called with the updated Expense row */
  onCreated?: (expense: Expense) => void;
  onUpdated?: (expense: Expense) => void;
}

// ── View Dialog ───────────────────────────────────────────────────────────────

function ViewDialog({
  expense,
  onClose,
}: {
  expense: Expense;
  onClose: () => void;
}) {
  return (
    <DetailDialog
      open
      onClose={onClose}
      title="Expense Details"
      icon={<Receipt size={20} />}
      badge={<StatusBadge status={expense.status} />}
      size="lg"
      fields={[
        { label: 'Expense ID',           value: expense.expenseId },
        { label: 'Title',                value: expense.title },
        { label: 'Date',                 value: expense.date },
        { label: 'Site Name',            value: expense.siteName },
        { label: 'Amount',               value: expense.amount },
        { label: 'Category',             value: expense.category },
        { label: 'Type',                 value: expense.type },
        { label: 'Unit',                 value: expense.unit },
        { label: 'Unit Rate',            value: expense.unitRate },
        { label: 'Multi Level Approval', value: expense.multiLevelApproval },
      ]}
    />
  );
}

// ── Add / Edit Dialog ─────────────────────────────────────────────────────────

function MutateDialog({
  mode,
  existing,
  employeeId,
  onClose,
  onCreated,
  onUpdated,
}: Required<Pick<ExpenseDialogProps, 'mode' | 'employeeId' | 'onClose'>> &
  Pick<ExpenseDialogProps, 'existing' | 'onCreated' | 'onUpdated'>) {
  const raw = existing?._raw;
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseForm>({
    defaultValues: {
      title:       isEdit && raw ? raw.title                                               : '',
      date:        isEdit && raw ? raw.date.split('T')[0]                                  : TODAY,
      siteName:    isEdit && raw ? raw.siteName                                            : '',
      amount:      isEdit && raw ? String(Number(raw.amount).toFixed(2))                   : '',
      category:    isEdit && raw ? raw.category                                            : EXPENSE_CATEGORIES[0],
      expenseType: isEdit && raw ? raw.expenseType                                         : 'AMOUNT_WISE',
      unit:        isEdit && raw ? (raw.unit ?? '')                                        : '',
      unitRate:    isEdit && raw && raw.unitRate != null
                     ? String(Number(raw.unitRate).toFixed(2))
                     : '',
    },
  });

  // Reset whenever the dialog is opened with new data
  useEffect(() => {
    reset({
      title:       isEdit && raw ? raw.title                                               : '',
      date:        isEdit && raw ? raw.date.split('T')[0]                                  : TODAY,
      siteName:    isEdit && raw ? raw.siteName                                            : '',
      amount:      isEdit && raw ? String(Number(raw.amount).toFixed(2))                   : '',
      category:    isEdit && raw ? raw.category                                            : EXPENSE_CATEGORIES[0],
      expenseType: isEdit && raw ? raw.expenseType                                         : 'AMOUNT_WISE',
      unit:        isEdit && raw ? (raw.unit ?? '')                                        : '',
      unitRate:    isEdit && raw && raw.unitRate != null
                     ? String(Number(raw.unitRate).toFixed(2))
                     : '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, mode]);

  const expenseType = watch('expenseType');
  const isUnitWise = expenseType === 'UNIT_WISE';

  const onSubmit = async (data: ExpenseForm) => {
    const amountNum = Number(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('amount', { message: 'Amount must be a positive number' });
      return;
    }
    if (isUnitWise) {
      const rateNum = Number(data.unitRate);
      if (isNaN(rateNum) || rateNum <= 0) {
        setError('unitRate', { message: 'Unit Rate must be a positive number' });
        return;
      }
    }

    const payload = {
      title:       data.title.trim(),
      date:        new Date(data.date).toISOString(),
      siteName:    data.siteName.trim(),
      amount:      amountNum,
      category:    data.category,
      expenseType: data.expenseType,
      unit:        isUnitWise ? data.unit.trim() : undefined,
      unitRate:    isUnitWise && data.unitRate ? Number(data.unitRate) : undefined,
    };

    try {
      if (isEdit && existing) {
        const res = await updateExpense(existing.id, payload);
        const updated = formatRawExpense(res.data?.data ?? { ...existing._raw, ...payload });
        onUpdated?.(updated);
      } else {
        const res = await createExpense({ ...payload, employeeId });
        const created = formatRawExpense(res.data?.data);
        onCreated?.(created);
      }
      onClose();
    } catch (err) {
      setError('root', {
        message:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as Error).message ??
          'Something went wrong. Please try again.',
      });
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="expense-form"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {isEdit ? 'Saving…' : 'Submitting…'}
          </>
        ) : isEdit ? (
          'Save Changes'
        ) : (
          'Submit Expense'
        )}
      </button>
    </>
  );

  return (
    <DetailDialog
      open
      onClose={onClose}
      title={isEdit ? 'Edit Expense' : 'Add Expense'}
      icon={<IndianRupee size={20} />}
      size="lg"
      footer={footer}
    >
      <form
        id="expense-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Title + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Title"
            placeholder="Enter expense title..."
            required
            errorMessage={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />
          <DatePicker
            label="Date"
            required
            max={TODAY}
            errorMessage={errors.date?.message}
            {...register('date', { required: 'Date is required' })}
          />
        </div>

        {/* Category + Expense Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            control={control}
            name="category"
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Dropdown
                label="Expense Category"
                required
                placeholder="-- Select --"
                options={CATEGORY_OPTIONS}
                errorMessage={errors.category?.message}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="expenseType"
            render={({ field }) => (
              <Dropdown
                label="Expense Type"
                required
                options={EXPENSE_TYPE_OPTIONS}
                errorMessage={errors.expenseType?.message}
                {...field}
              />
            )}
          />
        </div>

        {/* Site Name + Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Site"
            placeholder="e.g. Mumbai"
            required
            errorMessage={errors.siteName?.message}
            {...register('siteName', { required: 'Site name is required' })}
          />
          <TextInput
            label="Amount (₹)"
            type="number"
            placeholder="0.00"
            required
            errorMessage={errors.amount?.message}
            {...register('amount', { required: 'Amount is required' })}
          />
        </div>

        {/* Description / notes via TextArea — optional */}
        {/* Unit fields — shown only for Unit Wise */}
        {isUnitWise && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Unit"
              placeholder="e.g. km"
              required
              errorMessage={errors.unit?.message}
              {...register('unit', {
                validate: (v) =>
                  expenseType !== 'UNIT_WISE' || !!v.trim() || 'Unit is required',
              })}
            />
            <TextInput
              label="Unit Rate (₹)"
              type="number"
              placeholder="0.00"
              required
              errorMessage={errors.unitRate?.message}
              {...register('unitRate', {
                validate: (v) =>
                  expenseType !== 'UNIT_WISE' || !!v || 'Unit Rate is required',
              })}
            />
          </div>
        )}

        {/* Server / root error */}
        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {errors.root.message}
          </p>
        )}
      </form>
    </DetailDialog>
  );
}

// ── Public export — single entry point ────────────────────────────────────────

export default function ExpenseDialog({
  mode,
  existing,
  employeeId,
  onClose,
  onCreated,
  onUpdated,
}: ExpenseDialogProps) {
  if (!mode) return null;

  if (mode === 'view' && existing) {
    return <ViewDialog expense={existing} onClose={onClose} />;
  }

  return (
    <MutateDialog
      mode={mode}
      existing={existing}
      employeeId={employeeId}
      onClose={onClose}
      onCreated={onCreated}
      onUpdated={onUpdated}
    />
  );
}
