import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ListTodo, Loader2 } from 'lucide-react';
import DetailDialog from '../../../component/common/DetailDialog';
import TextInput from '../../../component/common/TextInput';
import TextArea from '../../../component/common/TextArea';
import Dropdown from '../../../component/common/Dropdown';
import DatePicker from '../../../component/common/DatePicker';
import { createTask } from '../../../service/task.service';
import type { FormattedTask, TaskPriority } from '../../../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface AddTaskForm {
  taskName: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the newly created task so the parent can prepend it to the table */
  onCreated: (task: FormattedTask) => void;
}

// ── Options ───────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { label: 'Basic (Indigo Color)', value: 'BASIC' },
  { label: 'Important (Red Color)', value: 'IMPORTANT' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddTaskDialog({ open, onClose, onCreated }: AddTaskDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddTaskForm>({
    defaultValues: {
      taskName: '',
      description: '',
      priority: 'BASIC',
      dueDate: '',
    },
  });

  const handleClose = () => {
    reset();
    setServerError('');
    onClose();
  };

  const onSubmit = async (data: AddTaskForm) => {
    setServerError('');
    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        taskName: data.taskName.trim(),
        description: data.description.trim(),
        priority: data.priority,
      };
      if (data.dueDate) {
        payload.dueDate = new Date(data.dueDate).toISOString();
      }

      const res = await createTask(payload);
      const raw = res.data.data;

      // Shape it the same way page.tsx does when it formats tasks
      const newTask: FormattedTask = {
        ...raw,
        title: raw.taskName,
        priority: raw.priority === 'IMPORTANT' ? 'Important' : 'Basic',
        status:
          raw.status === 'PENDING'
            ? 'Pending'
            : raw.status === 'COMPLETED'
            ? 'Completed'
            : 'Deleted',
        dueDate: raw.dueDate
          ? new Date(raw.dueDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : '—',
      };

      onCreated(newTask);
      handleClose();
    } catch (err) {
      setServerError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          (err as Error).message ??
          'Something went wrong. Please try again.'
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
        form="add-task-form"
        disabled={submitting}
        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
      >
        {submitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Saving…
          </>
        ) : (
          'Save Task'
        )}
      </button>
    </>
  );

  return (
    <DetailDialog
      open={open}
      onClose={handleClose}
      title="Add New Task"
      icon={<ListTodo size={20} />}
      size="md"
      footer={footer}
    >
      <form
        id="add-task-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Task Name */}
        <TextInput
          label="Task Name"
          placeholder="Enter task name..."
          required
          errorMessage={errors.taskName?.message}
          {...register('taskName', {
            required: 'Task name is required',
            maxLength: { value: 255, message: 'Max 255 characters' },
          })}
        />

        {/* Description */}
        <TextArea
          label="Description"
          placeholder="Enter task details or description..."
          rows={4}
          errorMessage={errors.description?.message}
          {...register('description')}
        />

        {/* Priority + Due Date side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Priority — controlled because Dropdown uses forwardRef select */}
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Dropdown
                label="Priority"
                options={PRIORITY_OPTIONS}
                errorMessage={errors.priority?.message}
                {...field}
              />
            )}
          />

          {/* Due Date */}
          <DatePicker
            label="Due Date"
            errorMessage={errors.dueDate?.message}
            {...register('dueDate')}
          />
        </div>

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
