import React, { useState } from 'react';
import { CreditCard, Trash2 } from 'lucide-react';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';

const columns = [
  { header: 'SR. NO', accessorKey: 'id' },
  { 
    header: 'ACTION', 
    accessorKey: 'action',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
            ${status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
            ${status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : ''}
            ${status === 'Declined' ? 'bg-rose-50 text-rose-600' : ''}
          `}>
            {status}
          </span>
          <button className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 size={16} /></button>
        </div>
      );
    }
  },
  { header: 'REQUESTED DATE', accessorKey: 'requestedDate' },
  { header: 'SALARY MONTH', accessorKey: 'salaryMonth', cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.salaryMonth}</span> },
  { header: 'AMOUNT', accessorKey: 'amount', cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.amount}</span> },
  { header: 'REMARK', accessorKey: 'remark' },
  { header: 'DECLINED REASON', accessorKey: 'declinedReason', cell: ({ row }) => <span className="text-slate-400">{row.original.declinedReason}</span> },
  { header: 'APPROVED/DECLINED DATE', accessorKey: 'resolvedDate', cell: ({ row }) => <span className="text-slate-400">{row.original.resolvedDate}</span> }
];

const data = [
  { 
    id: 1, 
    status: 'Pending', 
    requestedDate: '04:12 PM, 08th Sep 2025', 
    salaryMonth: 'August-2025', 
    amount: '10000.00', 
    remark: 'please send me I am at medical', 
    declinedReason: '—', 
    resolvedDate: '—' 
  }
];

export default function ApplyAdvance() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-indigo-500">
              <CreditCard size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Advance Salary Requests</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">Submit and track your salary advance request approvals</p>
        </div>
        <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm text-sm uppercase tracking-wide">
          ADD REQUEST ADVANCE SALARY
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalRecords={1}
          pageCount={1}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
}
