import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MapPin, Loader2, Check, X } from 'lucide-react';
import Dropdown from '../../../component/common/Dropdown';
import DatePicker from '../../../component/common/DatePicker';
import TextArea from '../../../component/common/TextArea';
import RadioButtonList from '../../../component/common/RadioButtonList';
import DetailDialog from '../../../component/common/DetailDialog';
import {
  createVisit,
  updateVisit,
  getCustomers,
} from '../../../service/visit.service';
import { getEmployees } from '../../../service/employee.service';
import type {
  Visit,
  VisitRaw,
  VisitCategory,
  VisitPurpose,
  VisitScheduleType,
  VisitLocationMode,
  VisitStatusUi,
  CustomerOption,
} from '../../../types';
import type { EmployeeListItem } from '../../../service/employee.service';

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

const CATEGORY_OPTIONS = [
  { label: 'Self Visit', value: 'SELF' },
  { label: 'Add visit for other employee', value: 'OTHER_EMPLOYEE' },
  { label: 'Visit With', value: 'VISIT_WITH' },
];

const PURPOSE_OPTIONS = [
  { label: 'Client Meeting', value: 'CLIENT_MEETING' },
  { label: 'Site Inspection', value: 'SITE_INSPECTION' },
  { label: 'Product Demo', value: 'PRODUCT_DEMO' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Support Visit', value: 'SUPPORT_VISIT' },
  { label: 'Other', value: 'OTHER' },
];

const SCHEDULE_TYPE_OPTIONS = [
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Unscheduled', value: 'UNSCHEDULED' },
];

const LOCATION_MODE_OPTIONS = [
  { label: 'Physical visit', value: 'PHYSICAL' },
  { label: 'Virtual Visit', value: 'VIRTUAL' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const toUiStatus = (raw: VisitRaw['status']): VisitStatusUi => {
  const map: Record<VisitRaw['status'], VisitStatusUi> = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return map[raw] ?? 'Scheduled';
};

const purposeLabel = (p: VisitPurpose) =>
  PURPOSE_OPTIONS.find((o) => o.value === p)?.label ?? p;

const categoryLabel = (c: VisitCategory) =>
  CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;

export const formatRawVisit = (r: VisitRaw): Visit => ({
  id: r.id,
  employeeName: r.employee?.name ?? '—',
  customerName: r.customer?.name ?? '—',
  visitDate: formatDate(r.visitDate),
  purpose: purposeLabel(r.purpose),
  visitType: r.scheduleType === 'SCHEDULED' ? 'Scheduled' : 'Unscheduled',
  locationMode: r.locationMode === 'PHYSICAL' ? 'Physical' : 'Virtual',
  category: categoryLabel(r.category),
  companionName: r.companionEmployee?.name ?? '—',
  remarks: r.remarks ?? '—',
  status: toUiStatus(r.status),
  _raw: r,
});

export function VisitStatusBadge({ status }: { status: VisitStatusUi }) {
  const cls: Record<VisitStatusUi, string> = {
    Scheduled: 'bg-blue-50 text-blue-600',
    Completed: 'bg-emerald-50 text-emerald-600',
    Cancelled: 'bg-rose-50 text-rose-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls[status]}`}>
      {status}
    </span>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface VisitForm {
  category: VisitCategory;
  targetEmployeeId: string;
  companionEmployeeId: string;
  customerId: string;
  visitDate: string;
  purpose: VisitPurpose;
  scheduleType: VisitScheduleType;
  locationMode: VisitLocationMode;
  remarks: string;
}

export type VisitDialogMode = 'add' | 'edit' | 'view' | null;

export interface VisitDialogProps {
  mode: VisitDialogMode;
  existing?: Visit | null;
  employeeId: number;
  onClose: () => void;
  onCreated?: (visit: Visit) => void;
  onUpdated?: (visit: Visit) => void;
}

// ── View Dialog ───────────────────────────────────────────────────────────────

function ViewDialog({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  return (
    <DetailDialog
      open
      onClose={onClose}
      title="Visit Details"
      icon={<MapPin size={20} />}
      badge={<VisitStatusBadge status={visit.status} />}
      size="full"
      fields={[
        { label: 'Employee', value: visit.employeeName },
        { label: 'Customer', value: visit.customerName },
        { label: 'Visit Date', value: visit.visitDate },
        { label: 'Purpose', value: visit.purpose },
        { label: 'Visit Type', value: visit.visitType },
        { label: 'Location Mode', value: visit.locationMode },
        { label: 'Category', value: visit.category },
        { label: 'Companion', value: visit.companionName, hidden: visit.companionName === '—' },
        { label: 'Remarks / Notes', value: visit.remarks, fullWidth: true },
      ]}
    />
  );
}

// ── Dark-header modal shell (matches MineHR screenshots) ─────────────────────

function VisitModalShell({
  onClose,
  footer,
  children,
}: {
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1a2236] px-5 py-3.5 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {children}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-white">
          {footer}
        </div>
      </div>
    </div>
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
}: Required<Pick<VisitDialogProps, 'mode' | 'employeeId' | 'onClose'>> &
  Pick<VisitDialogProps, 'existing' | 'onCreated' | 'onUpdated'>) {
  const raw = existing?._raw;
  const isEdit = mode === 'edit';

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VisitForm>({
    defaultValues: {
      category: 'SELF',
      targetEmployeeId: '',
      companionEmployeeId: '',
      customerId: '',
      visitDate: TODAY,
      purpose: 'CLIENT_MEETING',
      scheduleType: 'SCHEDULED',
      locationMode: 'PHYSICAL',
      remarks: '',
    },
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        setMetaLoading(true);
        const [custRes, empRes] = await Promise.all([
          getCustomers(),
          getEmployees(),
        ]);
        setCustomers(custRes.data?.data ?? []);
        setEmployees(
          (empRes.data?.data ?? []).filter((e: EmployeeListItem) => e.id !== employeeId)
        );
      } catch {
        setCustomers([]);
        setEmployees([]);
      } finally {
        setMetaLoading(false);
      }
    };
    loadMeta();
  }, [employeeId]);

  useEffect(() => {
    if (!isEdit || !raw) return;
    reset({
      category: raw.category,
      targetEmployeeId:
        raw.category === 'OTHER_EMPLOYEE' ? String(raw.employeeId) : '',
      companionEmployeeId:
        raw.category === 'VISIT_WITH' && raw.companionEmployeeId
          ? String(raw.companionEmployeeId)
          : '',
      customerId: String(raw.customerId),
      visitDate: raw.visitDate.split('T')[0],
      purpose: raw.purpose,
      scheduleType: raw.scheduleType,
      locationMode: raw.locationMode,
      remarks: raw.remarks ?? '',
    });
  }, [existing?.id, mode, raw, isEdit, reset]);

  const category = watch('category');
  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: String(c.id),
  }));
  const employeeOptions = employees.map((e) => ({
    label: e.name,
    value: String(e.id),
  }));

  const resolveEmployeeId = (data: VisitForm): number => {
    if (data.category === 'OTHER_EMPLOYEE') {
      return Number(data.targetEmployeeId);
    }
    return employeeId;
  };

  const onSubmit = async (data: VisitForm) => {
    if (!data.customerId) {
      setError('customerId', { message: 'Customer is required' });
      return;
    }
    if (data.category === 'OTHER_EMPLOYEE' && !data.targetEmployeeId) {
      setError('targetEmployeeId', { message: 'Select target employee' });
      return;
    }
    if (data.category === 'VISIT_WITH' && !data.companionEmployeeId) {
      setError('companionEmployeeId', { message: 'Select employee to visit with' });
      return;
    }

    const payload = {
      createdById: employeeId,
      category: data.category,
      employeeId: resolveEmployeeId(data),
      companionEmployeeId:
        data.category === 'VISIT_WITH'
          ? Number(data.companionEmployeeId)
          : undefined,
      customerId: Number(data.customerId),
      visitDate: new Date(data.visitDate).toISOString(),
      purpose: data.purpose,
      scheduleType: data.scheduleType,
      locationMode: data.locationMode,
      remarks: data.remarks.trim() || undefined,
    };

    try {
      if (isEdit && existing) {
        const res = await updateVisit(existing.id, {
          customerId: payload.customerId,
          visitDate: payload.visitDate,
          purpose: payload.purpose,
          scheduleType: payload.scheduleType,
          locationMode: payload.locationMode,
          remarks: payload.remarks,
        });
        onUpdated?.(formatRawVisit(res.data?.data));
      } else {
        const res = await createVisit(payload);
        onCreated?.(formatRawVisit(res.data?.data));
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
        className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold tracking-wide transition-colors"
      >
        CANCEL
      </button>
      <button
        type="submit"
        form="visit-form"
        disabled={isSubmitting || metaLoading}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold tracking-wide transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Check size={15} strokeWidth={3} />
            SAVE
          </>
        )}
      </button>
    </>
  );

  return (
    <VisitModalShell onClose={onClose} footer={footer}>
      <form
        id="visit-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {!isEdit && (
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <RadioButtonList
                name="visit-category"
                options={CATEGORY_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v as VisitCategory)}
              />
            )}
          />
        )}

        {!isEdit && category === 'OTHER_EMPLOYEE' && (
          <Controller
            control={control}
            name="targetEmployeeId"
            rules={{ required: 'Select target employee' }}
            render={({ field }) => (
              <Dropdown
                label="Select Target Employee"
                required
                placeholder="-- Choose Employee --"
                options={employeeOptions}
                disabled={metaLoading}
                errorMessage={errors.targetEmployeeId?.message}
                {...field}
              />
            )}
          />
        )}

        {!isEdit && category === 'VISIT_WITH' && (
          <Controller
            control={control}
            name="companionEmployeeId"
            rules={{ required: 'Select employee to visit with' }}
            render={({ field }) => (
              <Dropdown
                label="Select Employee to Visit With"
                required
                placeholder="-- Choose Employee --"
                options={employeeOptions}
                disabled={metaLoading}
                errorMessage={errors.companionEmployeeId?.message}
                {...field}
              />
            )}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            control={control}
            name="customerId"
            rules={{ required: 'Customer is required' }}
            render={({ field }) => (
              <Dropdown
                label="Customer to Visit"
                required
                placeholder="-- Select Customer --"
                options={customerOptions}
                disabled={metaLoading}
                errorMessage={errors.customerId?.message}
                {...field}
              />
            )}
          />
          <DatePicker
            label="Visit Date"
            required
            errorMessage={errors.visitDate?.message}
            {...register('visitDate', { required: 'Visit date is required' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Controller
            control={control}
            name="purpose"
            render={({ field }) => (
              <Dropdown
                label="Purpose of Visit"
                options={PURPOSE_OPTIONS}
                errorMessage={errors.purpose?.message}
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            name="locationMode"
            render={({ field }) => (
              <RadioButtonList
                label="Location Mode"
                name="location-mode"
                options={LOCATION_MODE_OPTIONS}
                value={field.value}
                onChange={(v) => field.onChange(v as VisitLocationMode)}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="scheduleType"
          render={({ field }) => (
            <Dropdown
              label="Visit Type"
              options={SCHEDULE_TYPE_OPTIONS}
              className="sm:max-w-[calc(50%-0.375rem)]"
              errorMessage={errors.scheduleType?.message}
              {...field}
            />
          )}
        />

        <TextArea
          label="Remarks / Notes"
          placeholder="Write meeting agenda or additional details..."
          rows={4}
          errorMessage={errors.remarks?.message}
          {...register('remarks')}
        />

        {errors.root && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {errors.root.message}
          </p>
        )}
      </form>
    </VisitModalShell>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export default function VisitDialog({
  mode,
  existing,
  employeeId,
  onClose,
  onCreated,
  onUpdated,
}: VisitDialogProps) {
  if (!mode) return null;

  if (mode === 'view' && existing) {
    return <ViewDialog visit={existing} onClose={onClose} />;
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
