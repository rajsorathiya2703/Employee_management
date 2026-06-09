import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';
import VisitDialog, {
  VisitStatusBadge,
  formatRawVisit,
  type VisitDialogMode,
} from './[id]/page';
import { getVisits, deleteVisit } from '../../service/visit.service';
import type { Visit, VisitRaw } from '../../types';
import { useAuth } from '../../context/AuthContext';

type VisitTab = 'my' | 'team';

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VisitManagement() {
  const { user } = useAuth();
  const EMPLOYEE_ID = user?.id ?? 1;

  const [visits, setVisits] = useState<Visit[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<VisitTab>('my');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filterDate, setFilterDate] = useState('');
  const [committedDate, setCommittedDate] = useState('');

  const [dialogMode, setDialogMode] = useState<VisitDialogMode>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getVisits(EMPLOYEE_ID, {
        scope: activeTab,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        ...(committedDate ? { date: committedDate } : {}),
      });
      const { data, pagination: meta } = res.data as {
        data: VisitRaw[];
        pagination: { total: number; pageIndex: number; pageSize: number };
      };
      setVisits(data.map(formatRawVisit));
      setTotalRecords(meta.total);
    } catch (err) {
      console.error('Failed to fetch visits:', err);
      setVisits([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [
    EMPLOYEE_ID,
    activeTab,
    pagination.pageIndex,
    pagination.pageSize,
    committedDate,
  ]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleTabChange = (tab: VisitTab) => {
    setActiveTab(tab);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleCreated = (visit: Visit) => {
    const matchesTab =
      activeTab === 'my'
        ? visit._raw?.employeeId === EMPLOYEE_ID ||
          visit._raw?.companionEmployeeId === EMPLOYEE_ID
        : visit._raw?.employeeId !== EMPLOYEE_ID;

    if (matchesTab) {
      setVisits((prev) => [visit, ...prev]);
      setTotalRecords((prev) => prev + 1);
    }
    setDialogMode(null);
    setSelectedVisit(null);
  };

  const handleUpdated = (updated: Visit) => {
    setVisits((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    setDialogMode(null);
    setSelectedVisit(null);
  };

  const handleDelete = async (visit: Visit) => {
    if (!window.confirm(`Delete visit to "${visit.customerName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteVisit(visit.id);
      setVisits((prev) => prev.filter((v) => v.id !== visit.id));
      setTotalRecords((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to delete visit.'
      );
    }
  };

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<Visit, unknown>[]>(
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
      ...(activeTab === 'team'
        ? [
            {
              header: 'EMPLOYEE',
              accessorKey: 'employeeName',
              cell: ({ row }: { row: { original: Visit } }) => (
                <span className="font-semibold text-slate-800">{row.original.employeeName}</span>
              ),
            } as ColumnDef<Visit, unknown>,
          ]
        : []),
      {
        header: 'CUSTOMER',
        accessorKey: 'customerName',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800">{row.original.customerName}</span>
        ),
      },
      { header: 'VISIT DATE', accessorKey: 'visitDate' },
      { header: 'PURPOSE', accessorKey: 'purpose' },
      { header: 'VISIT TYPE', accessorKey: 'visitType' },
      { header: 'LOCATION', accessorKey: 'locationMode' },
      {
        header: 'STATUS',
        accessorKey: 'status',
        cell: ({ row }) => <VisitStatusBadge status={row.original.status} />,
      },
      {
        id: 'action',
        header: 'ACTION',
        cell: ({ row }) => {
          const visit = row.original;
          const isScheduled = visit.status === 'Scheduled';
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedVisit(visit);
                  setDialogMode('view');
                }}
                className="text-indigo-500 hover:text-indigo-700 transition-colors"
                title="View details"
              >
                <Eye size={16} />
              </button>
              {isScheduled && (
                <>
                  <button
                    onClick={() => {
                      setSelectedVisit(visit);
                      setDialogMode('edit');
                    }}
                    className="text-amber-500 hover:text-amber-700 transition-colors"
                    title="Edit visit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(visit)}
                    className="text-rose-500 hover:text-rose-700 transition-colors"
                    title="Delete visit"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize, activeTab]
  );

  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;
  const tableTitle = activeTab === 'my' ? 'My Scheduled Visits' : 'All Team Visits';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <VisitDialog
        mode={dialogMode}
        existing={selectedVisit}
        employeeId={EMPLOYEE_ID}
        onClose={() => {
          setDialogMode(null);
          setSelectedVisit(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />

      <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                <MapPin size={24} strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Visit Management</h1>
            </div>
            <p className="text-slate-500 mt-1.5 text-sm">
              Track employee client visits and virtual consultations
            </p>
          </div>
          <button
            onClick={() => setDialogMode('add')}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} />
            ADD VISIT
          </button>
        </div>

        {/* Tabs + Date Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('my')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'my'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              My Visits
            </button>
            <button
              onClick={() => handleTabChange('team')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'team'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Other Employee Visits
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium min-w-[160px]"
            />
            <button
              onClick={() => {
                setCommittedDate(filterDate);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              className="border border-indigo-500 text-indigo-600 hover:bg-indigo-50 bg-white px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-colors"
            >
              GET
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-[520px]">
          <AdvancedDataTable
            title={tableTitle}
            columns={columns}
            data={visits}
            totalRecords={totalRecords}
            pageCount={pageCount}
            pagination={pagination}
            setPagination={setPagination}
            isLoading={loading}
            emptyMessage="No visits scheduled for this criteria"
            emptyIcon={<MapPin size={40} strokeWidth={1.5} className="mb-3 text-slate-300" />}
          />
        </div>
      </div>
    </>
  );
}
