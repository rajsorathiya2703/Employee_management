import { useForm } from 'react-hook-form';
import { CreditCard, Loader2 } from 'lucide-react';
import DetailDialog from '../../../../component/common/DetailDialog';
import TextInput from '../../../../component/common/TextInput';
import TextArea from '../../../../component/common/TextArea';
import { createAdvanceRequest } from '../../../../service/advance-salary.service';
import type { AdvanceRequest, AdvanceRequestRaw } from '../../../../types';

// ── Helpers (mirrored from parent so the dialog is self-contained) ─────────────

const getOrdinalSuffix = (day: number): string => {
  if (day % 10 === 1 && day % 100 !== 11) return 'st';
  if (day % 10 === 2 && day % 100 !== 12) return 'nd';
  if (day % 10 === 3 && day % 100 !== 13) return 'rd';
  return 'th';
};

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
  return `${time}, ${String(day).padStart(2, '0')}${getOrdinalSuffix(day)} ${month} ${year}`;
};

const formatSalaryMonth = (salaryMonth: string): string => {
  const [year, month] = salaryMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return `${date.toLocaleString('en-US', { month: 'long' })}-${year}`;
};

const toUiStatus = (raw: string): AdvanceRequest['status'] => {
  if (raw === 'APPROVED') return 'Approved';
  if (raw === 'DECLINED') return 'Declined';
  return 'Pending';
};

export const formatAdvanceRequest = (raw: AdvanceRequestRaw): AdvanceRequest => ({
  id: raw.id,
  status: toUiStatus(raw.status),
  requestedDate: formatDateTime(raw.createdAt),
  salaryMonth: formatSalaryMonth(raw.salaryMonth),
  amount: parseFloat(raw.amount).toFixed(2),
  remark: raw.remark,
  declinedReason: raw.declinedReason || '—',
  resolvedDate: raw.resolvedAt ? formatDateTime(raw.resolvedAt) : '—',
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdvanceRequestForm {
  salaryMonth: string; // "YYYY-MM"
  amount: string;
  remark: string;
}

export interface AdvanceSalaryDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  /** Called with the newly created request so the parent prepends it to the table */
  onCreated: (request: AdvanceRequest) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdvanceSalaryDialog({
  open,
  onClose,
  employeeId,
  onCreated,
}: AdvanceSalaryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdvanceRequestForm>({
    defaultValues: { salaryMonth: '', amount: '', remark: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: AdvanceRequestForm) => {
    const amountNum = Number(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('amount', { message: 'Amount must be a positive number' });
      return;
    }

    try {
      const res = await createAdvanceRequest({
        employeeId,
        salaryMonth: data.salaryMonth, // already "YYYY-MM"
        amount: amountNum,
        remark: data.remark.trim(),
      });

      const raw: AdvanceRequestRaw = res.data?.data;

      // Optimistic shape when API returns the full raw object
      const newRequest: AdvanceRequest = raw
        ? formatAdvanceRequest(raw)
        : {
            id: Date.now(),
            status: 'Pending',
            requestedDate: formatDateTime(new Date().toISOString()),
            salaryMonth: formatSalaryMonth(data.salaryMonth),
            amount: amountNum.toFixed(2),
            remark: data.remark.trim(),
            declinedReason: '—',
            resolvedDate: '—',
          };

      onCreated(newRequest);
      handleClose();
    } catch (err) {
      setError('root', {
        message:
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as Error).message ??
          'Failed to submit request. Please try again.',
      });
    }
  };

  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="advance-salary-form"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit Request'
        )}
      </button>
    </>
  );

  return (
    <DetailDialog
      open={open}
      onClose={handleClose}
      title="Request Advance Salary"
      icon={<CreditCard size={20} />}
      size="md"
      footer={footer}
    >
      <form
        id="advance-salary-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Salary Month — native month picker gives "YYYY-MM" value */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="salaryMonth" className="text-sm font-semibold text-slate-700">
            Salary Month <span className="text-red-500">*</span>
          </label>
          <input
            id="salaryMonth"
            type="month"
            className={`border rounded-lg px-3 py-2 text-sm text-slate-700 bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.salaryMonth ? 'border-red-500' : 'border-slate-200'}`}
            {...register('salaryMonth', { required: 'Salary month is required' })}
          />
          {errors.salaryMonth && (
            <span className="text-sm text-red-500">{errors.salaryMonth.message}</span>
          )}
        </div>

        {/* Amount */}
        <TextInput
          label="Amount"
          type="number"
          placeholder="Enter amount (e.g. 10000)"
          required
          errorMessage={errors.amount?.message}
          {...register('amount', { required: 'Amount is required' })}
        />

        {/* Remark */}
        <TextArea
          label="Remark"
          required
          placeholder="Enter remark or purpose for salary advance..."
          rows={4}
          errorMessage={errors.remark?.message}
          {...register('remark', {
            required: 'Remark is required',
            minLength: { value: 5, message: 'Please provide more detail (min 5 chars)' },
          })}
        />

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
