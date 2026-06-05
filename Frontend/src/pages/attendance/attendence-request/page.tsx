import { useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import type { AttendanceRequest } from '../../../types';

const columns: ColumnDef<AttendanceRequest, unknown>[] = [
  { header: 'DATE', accessorKey: 'date' },
  { header: 'TYPE', accessorKey: 'type' },
  { header: 'REASON', accessorKey: 'reason' },
  {
    header: 'STATUS',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === 'Approved') {
        return (
          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
            Approved
          </span>
        );
      }
      if (status === 'Pending') {
        return (
          <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
      }
      return <span>{status}</span>;
    },
  },
];

const data: AttendanceRequest[] = [
  {
    id: 1,
    date: '24 May 2026',
    type: 'Punch-Out Adjustment',
    reason: 'Fingerprint scanner mismatch on punch-out',
    status: 'Approved',
  },
  {
    id: 2,
    date: '18 May 2026',
    type: 'Full Day Present',
    reason: 'Official client visit offsite',
    status: 'Pending',
  },
];

export default function AttendanceRequests() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="text-slate-800" size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-slate-800">Attendance Requests</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">Submit and view attendance adjustments</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} strokeWidth={2.5} />
          New Request
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          title="Request History"
          columns={columns}
          data={data}
          totalRecords={data.length}
          pageCount={1}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
}
