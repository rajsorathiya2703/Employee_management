import { useState, useEffect, useMemo } from 'react';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';
import GenericCard from '../../component/common/GenericCard';
import {
  CheckCircle2, Clock, Trash2, CheckCircle, Calendar, Search,
  ListTodo, Plus, Star, Hourglass,
} from 'lucide-react';
import clsx from 'clsx';
import {
  getTasks,
  getDashboard,
  completeTask,
  deleteTask,
} from '../../service/task.service';
import type { FormattedTask, TaskDashboard } from '../../types';

// suppress unused import
void CheckCircle;

type TabLabel = 'All' | 'Pending' | 'Completed' | 'Deleted Tasks';

export default function TaskManagement() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [activeTab, setActiveTab] = useState<TabLabel>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<FormattedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<TaskDashboard>({
    myDayTask: 0,
    importantTask: 0,
    todayDueTask: 0,
    totalPending: 0,
    completedTask: 0,
  });

  const tabs: TabLabel[] = ['All', 'Pending', 'Completed', 'Deleted Tasks'];

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const params: Record<string, unknown> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (activeTab !== 'All' && activeTab !== 'Deleted Tasks') {
        params.status = activeTab.toUpperCase();
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const res = await getTasks(params);

      const formattedTasks: FormattedTask[] = res.data.data.data.map(
        (task: FormattedTask) => ({
          ...task,
          title: task.taskName,
          priority: task.priority === 'IMPORTANT' ? 'Important' : 'Basic',
          status:
            task.status === 'PENDING'
              ? 'Pending'
              : task.status === 'COMPLETED'
              ? 'Completed'
              : 'Deleted',
        })
      );

      setTasks(formattedTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setDashboard(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, activeTab, searchTerm]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // After formatting, task.status is a UI label: 'Pending' | 'Completed' | 'Deleted'
  type UIStatus = 'Pending' | 'Completed' | 'Deleted';

  const filteredData = tasks.filter((task) => {
    const uiStatus = task.status as unknown as UIStatus;

    if (activeTab === 'Deleted Tasks') return uiStatus === 'Deleted';

    const tabMatch = activeTab === 'All' ? true : uiStatus === (activeTab as UIStatus);

    const searchMatch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.priority.toLowerCase().includes(searchTerm.toLowerCase());

    return tabMatch && searchMatch;
  });

  const columns = useMemo<ColumnDef<FormattedTask, unknown>[]>(
    () => [
      {
        id: 'serialNo',
        header: '#',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: 'taskDetails',
        header: 'TASK DETAILS',
        cell: (info) => (
          <div className="flex flex-col gap-1 py-1">
            <span className="font-semibold text-slate-800 text-[15px]">
              {info.row.original.title}
            </span>
            <span className="text-slate-500 text-sm">{info.row.original.description}</span>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'PRIORITY',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold',
                val === 'Important' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
              )}
            >
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'dueDate',
        header: 'DUE DATE',
        cell: (info) => (
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
            <Calendar size={14} className="text-slate-400" />
            <span>{info.getValue() as string}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'STATUS',
        cell: (info) => {
          const val = info.getValue() as string;
          return (
            <span
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit',
                val === 'Pending'
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-emerald-50 text-emerald-600'
              )}
            >
              {val === 'Pending' ? (
                <Clock size={12} strokeWidth={3} />
              ) : (
                <CheckCircle2 size={12} strokeWidth={3} />
              )}
              {val}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        cell: (info) => (
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                await completeTask(info.row.original.id);
                fetchTasks();
                fetchDashboard();
              }}
            >
              <CheckCircle2 />
            </button>
            <button
              onClick={async () => {
                await deleteTask(info.row.original.id);
                fetchTasks();
                fetchDashboard();
              }}
            >
              <Trash2 />
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.pageIndex, pagination.pageSize]
  );

  const topContent = (
    <>
      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 overflow-x-auto w-full sm:w-auto shrink-0 custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="relative w-full sm:w-64 shrink-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 bg-white"
        />
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="text-blue-600" size={28} strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-slate-800">Task Management</h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm">
            View, prioritize and manage your tasks in a single view
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} strokeWidth={2.5} />
          Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 shrink-0">
        <GenericCard
          title="MY DAY TASK"
          value={dashboard.myDayTask}
          icon={<Calendar size={22} />}
          color="purple"
          iconPosition="right"
        />
        <GenericCard
          title="IMPORTANT TASK"
          value={dashboard.importantTask}
          icon={<Star size={22} />}
          color="sky"
          iconPosition="right"
        />
        <GenericCard
          title="TODAY'S DUE TASK"
          value={dashboard.todayDueTask}
          icon={<Hourglass size={22} />}
          color="yellow"
          iconPosition="right"
        />
        <GenericCard
          title="TOTAL PENDING"
          value={dashboard.totalPending}
          icon={<Clock size={22} />}
          color="blue"
          iconPosition="right"
        />
        <GenericCard
          title="COMPLETED TASK"
          value={dashboard.completedTask}
          icon={<CheckCircle2 size={22} />}
          color="green"
          iconPosition="right"
        />
      </div>

      {/* Table Area */}
      <div className="flex-1 min-h-[520px]">
        <AdvancedDataTable
          columns={columns}
          data={filteredData}
          totalRecords={filteredData.length}
          pageCount={Math.ceil(filteredData.length / pagination.pageSize)}
          pagination={pagination}
          setPagination={setPagination}
          isLoading={loading}
          topContent={topContent}
        />
      </div>
    </div>
  );
}
