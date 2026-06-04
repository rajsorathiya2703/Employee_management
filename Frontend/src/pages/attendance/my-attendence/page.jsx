import React, { useState } from 'react';
import { ClipboardList, ChevronRight, Calendar } from 'lucide-react';
import AdvancedDataTable from '../../../component/common/AdvancedDataTable';
import { useEffect } from "react";
import { getMyAttendance } from "../../../service/attendance.service";

const columns = [
  {
    header: '',
    accessorKey: 'expand',
    cell: () => (
      <button className="text-slate-400 hover:text-slate-600 transition-colors">
        <ChevronRight size={18} />
      </button>
    )
  },
  { header: 'DATE', accessorKey: 'date', cell: ({ row }) => <span className="font-semibold text-slate-700">{row.original.date}</span> },
  { header: 'PUNCH IN', accessorKey: 'punchIn' },
  { header: 'PUNCH OUT', accessorKey: 'punchOut' },
  { header: 'WORKING HOURS', accessorKey: 'workingHours' },
  {
    header: 'STATUS',
    accessorKey: 'status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">
          {status}
        </span>
      );
    }
  }
];

export default function MyAttendance() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchAttendance = async () => {
    try {
      setLoading(true);

      // Replace with logged in employee id
      const employeeId = 1;
      console.log("Fetching attendance for employee ID:", employeeId, "with pagination:", pagination);

      const res = await getMyAttendance(
        employeeId,
        {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
        }
      );
      console.log("Attendance API Response:", res.data);

      const formattedData = res.data.data.map(
        (attendance, index) => ({
          id: index + 1,

          date: formatDate(
            attendance.attendanceDate
          ),

          punchIn: formatTime(
            attendance.firstPunchIn
          ),

          punchOut: formatTime(
            attendance.lastPunchOut
          ),

          workingHours: formatWorkingHours(
            attendance.totalMinutes
          ),

          status:
            attendance.status === "PRESENT"
              ? "Present"
              : attendance.status,
        })
      );

      setAttendanceData(formattedData);
    } catch (error) {
      console.log("FULL ERROR =>", error);

      console.log("MESSAGE =>", error.message);

      console.log("RESPONSE =>", error.response);

      console.log("REQUEST =>", error.request);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWorkingHours = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const topContent = (
    <div className="relative">
      <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-indigo-500 transition-colors cursor-pointer group">
        <span className="text-sm font-medium text-slate-700 mr-8">June, 2026</span>
        <Calendar size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </div>
      <input
        type="month"
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        defaultValue="2026-06"
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-slate-800">
              <ClipboardList size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">View your attendance records</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          title="Attendance Records"
          topContent={topContent}
          columns={columns}
          data={attendanceData}
          totalRecords={attendanceData.length}
          pageCount={
            Math.ceil(
              attendanceData.length /
              pagination.pageSize
            )
          }
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
}
