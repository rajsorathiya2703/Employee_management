import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ClipboardList, Loader2 } from 'lucide-react';
import DetailDialog from '../../../../component/common/DetailDialog';
import DatePicker from '../../../../component/common/DatePicker';
import Dropdown from '../../../../component/common/Dropdown';
import TextArea from '../../../../component/common/TextArea';
import { createAttendanceRequest } from '../../../../service/attendance.service';
import type { AttendanceRequest, AttendanceRequestType } from '../../../../types';

// ── Constants ─────────────────────────────────────────────────────────────────

const REQUEST_TYPES: { value: AttendanceRequestType; label: string }[] = [
  { value: 'PUNCH_IN_ADJUSTMENT',  label: 'Punch-In Adjustment' },
  { value: 'PUNCH_OUT_ADJUSTMENT', label: 'Punch-Out Adjustment' },
  { value: 'FULL_DAY_PRESENT',     label: 'Full Day Present' },
  { value: 'HALF_DAY_PRESENT',     label: 'Half Day Present' },
  { value: 'WORK_FROM_HOME',       label: 'Work From Home' },
  { value: 'OTHER',                label: 'Other' },
];

const TYPE_LABEL: Record<AttendanceRequestType, string> = Object.fromEntries(
  REQUEST_TYPES.map(({ value, label }) => [value, label])
) as Record<AttendanceRequestType, string>;

const TODAY = new Date().toISOString().split('T')[0];

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttendanceRequestForm {
  date: string;
  type: AttendanceRequestType;
  reason: string;
}

export interface NewAttendanceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  /** Called with the optimistically formatted record so the parent can prepend it to the table */
  onCreated: (request: AttendanceRequest) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewAttendanceRequestDialog({
  open,
  onClose,
  employeeId,
  onCreated,
}: NewAttendanceRequestDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AttendanceRequestForm>({
    defaultValues: {
      date: '',
      type: 'PUNCH_IN_ADJUSTMENT',
      reason: '',
    },
  });

  const handleClose = () => {
    reset();
    setServerError('');
    onClose();
  };

  const onSubmit = async (data: AttendanceRequestForm) => {
    setServerError('');
    try {
      setSubmitting(true);
      const res = await createAttendanceRequest({
        employeeId,
        date: new Date(data.date).toISOString(),
        type: data.type,
        reason: data.reason.trim(),
      });

      const raw = res.data?.data;

      // Shape matches AttendanceRequest used in the table
      const newRequest: AttendanceRequest = {
        id: raw?.id ?? Date.now(),
        date: new Date(data.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        type: TYPE_LABEL[data.type] ?? data.type,
        reason: data.reason.trim(),
        status: 'Pending',
      };

      onCreated(newRequest);
      handleClose();
    } catch (err) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as Error).message ??
          'Failed to submit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
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
        form="attendance-request-form"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        {submitting ? (
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
      title="New Attendance Adjustment"
      icon={<ClipboardList size={20} />}
      size="md"
      footer={footer}
    >
      <form
        id="attendance-request-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Date */}
        <DatePicker
          label="Date"
          required
          max={TODAY}
          errorMessage={errors.date?.message}
          {...register('date', { required: 'Date is required' })}
        />

        {/* Adjustment Type */}
        <Controller
          control={control}
          name="type"
          rules={{ required: 'Please select a request type' }}
          render={({ field }) => (
            <Dropdown
              label="Adjustment Type"
              required
              options={REQUEST_TYPES}
              errorMessage={errors.type?.message}
              {...field}
            />
          )}
        />

        {/* Reason */}
        <TextArea
          label="Reason / Remarks"
          required
          placeholder="Explain the reason for adjustment request..."
          rows={4}
          errorMessage={errors.reason?.message}
          {...register('reason', {
            required: 'Reason is required',
            minLength: { value: 5, message: 'Please provide more detail (min 5 chars)' },
          })}
        />

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {serverError}
          </p>
        )}
      </form>
    </DetailDialog>
  );
}
