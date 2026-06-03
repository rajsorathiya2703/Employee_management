import React, { useState } from 'react';
import { Receipt, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';

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
            ${status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : ''}
            ${status === 'Pending' ? 'bg-amber-50 text-amber-600' : ''}
            ${status === 'Unpaid' ? 'bg-slate-100 text-slate-600' : ''}
            ${status === 'Rejected' ? 'bg-rose-50 text-rose-600' : ''}
          `}>
            {status}
          </span>
          <button className="text-indigo-500 hover:text-indigo-700 transition-colors"><Eye size={16} /></button>
          <button className="text-amber-500 hover:text-amber-700 transition-colors"><Edit2 size={16} /></button>
          <button className="text-rose-500 hover:text-rose-700 transition-colors"><Trash2 size={16} /></button>
        </div>
      );
    }
  },
  { header: 'MULTI LEVEL APPROVAL', accessorKey: 'multiLevelApproval' },
  { header: 'EXPENSE ID', accessorKey: 'expenseId', cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.expenseId}</span> },
  { header: 'TITLE', accessorKey: 'title', cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.title}</span> },
  { header: 'DATE', accessorKey: 'date' },
  { header: 'SITE NAME', accessorKey: 'siteName' },
  { header: 'AMOUNT', accessorKey: 'amount', cell: ({ row }) => <span className="font-bold text-slate-800">{row.original.amount}</span> },
  { header: 'CATEGORY', accessorKey: 'category' },
  { header: 'TYPE', accessorKey: 'type' },
  { header: 'UNIT', accessorKey: 'unit' },
  { header: 'UNIT RATE', accessorKey: 'unitRate' }
];

const data = [
  { 
    id: 1, 
    status: 'Paid', 
    multiLevelApproval: '—', 
    expenseId: 'EXP4177', 
    title: 'travel expense', 
    date: '02 Jun 2026', 
    siteName: 'Mumbai', 
    amount: '₹1008.00', 
    category: 'Bike11 - petrol', 
    type: 'Amount Wise', 
    unit: '—', 
    unitRate: '—' 
  }
];

export default function MyExpenses() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [activeFilter, setActiveFilter] = useState('Pending');

  const filterTabs = [
    { name: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    { name: 'Unpaid', color: 'text-slate-600 bg-slate-50 border-slate-200', dot: 'bg-slate-500' },
    { name: 'Paid', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
    { name: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-200', dot: 'bg-rose-500' }
  ];

  const topContent = (
    <div className="flex items-center gap-2">
      {filterTabs.map(tab => (
        <button
          key={tab.name}
          onClick={() => setActiveFilter(tab.name)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-semibold transition-all ${
            activeFilter === tab.name ? 'ring-2 ring-indigo-500 ring-offset-1 opacity-100' : 'opacity-70 hover:opacity-100'
          } ${tab.color}`}
        >
          <div className={`w-2 h-2 rounded-full ${tab.dot}`}></div>
          {tab.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
              <Receipt size={24} strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Expenses</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">Track, filter and manage your submitted reimbursement claims</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} strokeWidth={2.5} />
          ADD EXPENSE
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-indigo-500 text-white rounded-xl px-6 py-4 flex items-center shadow-sm shrink-0">
        <h2 className="text-lg font-semibold tracking-wide">
          Total Amount : ₹ 1908.00
        </h2>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          showMonthYearFilter={true}
          onMonthYearGet={() => console.log('Get data')}
          topContent={topContent}
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
