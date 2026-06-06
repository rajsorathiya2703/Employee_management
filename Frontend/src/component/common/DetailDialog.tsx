import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

// ── Types ────────────────────────────────────────────────────────────────────

/** A single key-value field row rendered inside the dialog body */
export interface DetailField {
  label: string;
  value: ReactNode;
  /** Span 2 columns on ≥ md screens. Useful for wide content like descriptions. */
  fullWidth?: boolean;
  /** Hide this field entirely (useful for conditional fields) */
  hidden?: boolean;
}

/** A named section that groups related fields with an optional section title */
export interface DetailSection {
  /** Optional section heading rendered above its fields */
  title?: string;
  fields: DetailField[];
}

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DetailDialogProps {
  /** Controls open/close state */
  open: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Dialog heading */
  title: string;
  /** Optional icon rendered left of the title */
  icon?: ReactNode;
  /** Optional badge / tag rendered right of the title (e.g. a status pill) */
  badge?: ReactNode;
  /**
   * Content of the dialog body.
   * Pass either:
   *  - `fields` — flat list of key-value pairs
   *  - `sections` — grouped list of key-value pairs
   *  - `children` — fully custom JSX
   */
  fields?: DetailField[];
  sections?: DetailSection[];
  children?: ReactNode;
  /**
   * Footer action buttons rendered in the bottom bar.
   * If omitted a default "Close" button is shown.
   */
  footer?: ReactNode;
  /** Max width of the dialog panel. Defaults to `"md"` */
  size?: DialogSize;
  className?: string;
}

// ── Size map ─────────────────────────────────────────────────────────────────

const sizeClass: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-3xl',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldGrid({ fields }: { fields: DetailField[] }) {
  const visible = fields.filter((f) => !f.hidden);
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
      {visible.map((field, i) => (
        <div
          key={i}
          className={clsx(
            'flex flex-col gap-0.5 min-w-0',
            field.fullWidth && 'sm:col-span-2'
          )}
        >
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            {field.label}
          </span>
          <span className="text-sm font-medium text-slate-700 break-words">
            {field.value ?? <span className="text-slate-300">—</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DetailDialog({
  open,
  onClose,
  title,
  icon,
  badge,
  fields,
  sections,
  children,
  footer,
  size = 'md',
  className,
}: DetailDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className={clsx(
          // Base layout
          'relative bg-white w-full flex flex-col overflow-hidden',
          // Mobile: full-width bottom sheet with rounded top corners
          'rounded-t-2xl sm:rounded-2xl',
          // Max height — scrollable body
          'max-h-[92dvh] sm:max-h-[90vh]',
          // Shadow
          'shadow-2xl',
          // Size cap
          sizeClass[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <span className="shrink-0 text-indigo-500">{icon}</span>
            )}
            <h2 className="text-base font-bold text-slate-800 truncate">{title}</h2>
            {badge && <span className="shrink-0 ml-1">{badge}</span>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className={clsx(
              'shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-full',
              'text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors'
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className={clsx(
            'flex-1 overflow-y-auto px-5 py-5',
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
        >
          {/* Custom children take priority */}
          {children}

          {/* Sections mode */}
          {!children && sections && sections.length > 0 && (
            <div className="flex flex-col gap-6">
              {sections.map((section, si) => (
                <div key={si} className="flex flex-col gap-3">
                  {section.title && (
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5">
                      {section.title}
                    </h3>
                  )}
                  <FieldGrid fields={section.fields} />
                </div>
              ))}
            </div>
          )}

          {/* Flat fields mode */}
          {!children && !sections && fields && fields.length > 0 && (
            <FieldGrid fields={fields} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3 bg-white">
          {footer ?? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
