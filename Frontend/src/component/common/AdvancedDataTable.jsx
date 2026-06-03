import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function AdvancedDataTable({
  columns,
  data,
  totalRecords,
  pagination,
  setPagination,
  pageCount,
  isLoading = false,
  title,
  topContent,
  showMonthYearFilter,
  onMonthYearGet,
}) {
  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;

  // Calculate shown records logic
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords || data.length);

  // Generate page chips
  const renderPageChips = () => {
    const chips = [];
    const maxVisibleChips = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleChips / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleChips - 1);

    if (endPage - startPage + 1 < maxVisibleChips) {
      startPage = Math.max(1, endPage - maxVisibleChips + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      chips.push(
        <button
          key={i}
          onClick={() => table.setPageIndex(i - 1)}
          className={clsx(
            "w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
            currentPage === i
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
          )}
        >
          {i}
        </button>
      );
    }
    return chips;
  };

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Optional Top Header */}
      {(title || topContent || showMonthYearFilter) && (
        <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title && <h2 className="text-[17px] font-bold text-slate-800">{title}</h2>}
          
          {showMonthYearFilter && (
            <div className="flex items-center gap-3">
              <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium">
                <option>All Months</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
              <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium">
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </select>
              <button 
                onClick={onMonthYearGet}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-colors"
              >
                GET
              </button>
            </div>
          )}

          {topContent && (
            <div className={clsx("flex items-center gap-4 w-full", (title || showMonthYearFilter) ? "sm:w-auto justify-end" : "justify-between")}>
              {topContent}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Table Area */}
      <div className="flex-1 overflow-auto min-h-0 relative w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p>Loading records...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <AlertCircle size={40} strokeWidth={1.5} className="mb-3 text-slate-400" />
                    <p className="text-base font-medium">No Data Available !</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors duration-150 group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-white gap-4">
        {/* Left Side: Limit & Record Info */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Show:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          
          <div className="hidden sm:block">
            {totalRecords > 0 ? (
              <span>
                Showing <span className="font-semibold text-slate-800">{endRecord}</span> out of <span className="font-semibold text-slate-800">{totalRecords}</span> records
              </span>
            ) : (
              <span>0 records</span>
            )}
          </div>
        </div>

        {/* Right Side: Pagination Chips */}
        {totalPages > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="flex items-center gap-1 px-3 h-8 rounded-md border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="flex items-center gap-1 mx-1">
              {renderPageChips()}
            </div>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="flex items-center gap-1 px-3 h-8 rounded-md border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
