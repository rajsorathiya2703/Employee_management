import { useForm } from 'react-hook-form';
import { Loader2, DollarSign } from 'lucide-react';
import DetailDialog from '../../../../component/common/DetailDialog';
import TextInput from '../../../../component/common/TextInput';
import TextArea from '../../../../component/common/TextArea';
import { createLoanRequest } from '../../../../service/loan.service';
import type { LoanRequest, LoanRequestRaw } from '../../../../types';

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

const toUiStatus = (raw: string): LoanRequest['status'] => {
  if (raw === 'APPROVED') return 'Approved';
  if (raw === 'REJECTED') return 'Rejected';
  if (raw === 'DISBURSED') return 'Disbursed';
  if (raw === 'REPAID') return 'Repaid';
  return 'Pending';
};

export const formatLoanRequest = (raw: LoanRequestRaw): LoanRequest => ({
  id: raw.id,
  status: toUiStatus(raw.status),
  requestedDate: formatDateTime(raw.createdAt),
  loanAmount: parseFloat(raw.loanAmount).toFixed(2),
  reason: raw.reason,
  repaymentPeriod: raw.repaymentPeriod,
  approvedAmount: raw.approvedAmount ? parseFloat(raw.approvedAmount).toFixed(2) : '—',
  rejectionReason: raw.rejectionReason || '—',
  approvedDate: raw.approvedAt ? formatDateTime(raw.approvedAt) : '—',
  disbursedDate: raw.disbursedAt ? formatDateTime(raw.disbursedAt) : '—',
  repaidDate: raw.repaidAt ? formatDateTime(raw.repaidAt) : '—',
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoanRequestForm {
  loanAmount: string;
  repaymentPeriod: string;
  reason: string;
}

export interface LoanDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  /** Called with the newly created request so the parent prepends it to the table */
  onCreated: (request: LoanRequest) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoanDialog({
  open,
  onClose,
  employeeId,
  onCreated,
}: LoanDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoanRequestForm>({
    defaultValues: { loanAmount: '', repaymentPeriod: '12', reason: '' },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: LoanRequestForm) => {
    const amountNum = Number(data.loanAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('loanAmount', { message: 'Loan amount must be a positive number' });
      return;
    }

    const periodNum = Number(data.repaymentPeriod);
    if (isNaN(periodNum) || periodNum <= 0) {
      setError('repaymentPeriod', { message: 'Repayment period must be a positive number' });
      return;
    }

    try {
      const res = await createLoanRequest({
        employeeId,
        loanAmount: amountNum,
        repaymentPeriod: periodNum,
        reason: data.reason.trim(),
      });

      const raw: LoanRequestRaw = res.data?.data;

      // Optimistic shape when API returns the full raw object
      const newRequest: LoanRequest = raw
        ? formatLoanRequest(raw)
        : {
            id: Date.now(),
            status: 'Pending',
            requestedDate: formatDateTime(new Date().toISOString()),
            loanAmount: amountNum.toFixed(2),
            reason: data.reason.trim(),
            repaymentPeriod: periodNum,
            approvedAmount: '—',
            rejectionReason: '—',
            approvedDate: '—',
            disbursedDate: '—',
            repaidDate: '—',
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
        form="loan-form"
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
      title="Apply for Loan"
      icon={<DollarSign size={20} />}
      size="md"
      footer={footer}
    >
      <form
        id="loan-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Loan Amount */}
        <TextInput
          label="Loan Amount"
          type="number"
          placeholder="50000"
          step="100"
          min="1"
          required
          error={errors.loanAmount?.message}
          {...register('loanAmount', {
            required: 'Loan amount is required',
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: 'Please enter a valid amount',
            },
          })}
        />

        {/* Repayment Period */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="repaymentPeriod" className="text-sm font-semibold text-slate-700">
            Repayment Period (Months) <span className="text-red-500">*</span>
          </label>
          <select
            id="repaymentPeriod"
            className={`border rounded-lg px-3 py-2 text-sm text-slate-700 bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 w-full
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.repaymentPeriod ? 'border-red-500' : 'border-slate-200'}`}
            {...register('repaymentPeriod', { required: 'Repayment period is required' })}
          >
            <option value="">Select period</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="18">18 Months</option>
            <option value="24">24 Months</option>
            <option value="36">36 Months</option>
            <option value="48">48 Months</option>
            <option value="60">60 Months</option>
          </select>
          {errors.repaymentPeriod && (
            <span className="text-sm text-red-500">{errors.repaymentPeriod.message}</span>
          )}
        </div>

        {/* Reason */}
        <TextArea
          label="Reason for Loan"
          placeholder="Explain your reason for requesting this loan..."
          required
          error={errors.reason?.message}
          {...register('reason', {
            required: 'Reason is required',
            minLength: { value: 10, message: 'Reason must be at least 10 characters' },
          })}
        />

        {/* Root error */}
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errors.root.message}</p>
          </div>
        )}
      </form>
    </DetailDialog>
  );
}
