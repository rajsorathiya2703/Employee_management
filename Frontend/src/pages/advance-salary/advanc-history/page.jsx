import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';

const columns = [
  { header: 'SR. NO', accessorKey: 'id' },
  { header: 'AMOUNT', accessorKey: 'amount' },
  { header: 'GIVEN MODE', accessorKey: 'givenMode' },
  { header: 'GIVEN DATE', accessorKey: 'givenDate' },
  { header: 'CREATED DATE', accessorKey: 'createdDate' },
  { header: 'REMARK', accessorKey: 'remark' }
];

const data = [];

export default function AdvanceHistory() {
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
            <h1 className="text-2xl font-bold text-slate-800">Advance Salary</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">View past advance salary payout history records</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          columns={columns}
          data={data}
          totalRecords={0}
          pageCount={0}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
}
