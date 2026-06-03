import React, { useState } from 'react';
import AdvancedDataTable from '../../component/common/AdvancedDataTable';
import GenericCard from '../../component/common/GenericCard';
import {
    CheckCircle2, Clock, Trash2, CheckCircle, Calendar, Search,
    ListTodo, Plus, Star, Hourglass
} from 'lucide-react';
import clsx from 'clsx';

export default function TaskManagement() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [activeTab, setActiveTab] = useState('All');

    const columns = [
        {
            accessorKey: 'id',
            header: '#',
            cell: (info) => <span className="text-slate-500 font-medium">{info.getValue()}</span>
        },
        {
            accessorKey: 'taskDetails',
            header: 'TASK DETAILS',
            cell: (info) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="font-semibold text-slate-800 text-[15px]">{info.row.original.title}</span>
                    <span className="text-slate-500 text-sm">{info.row.original.description}</span>
                </div>
            )
        },
        {
            accessorKey: 'priority',
            header: 'PRIORITY',
            cell: (info) => {
                const val = info.getValue();
                return (
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        val === 'Important' ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                    )}>
                        {val}
                    </span>
                );
            }
        },
        {
            accessorKey: 'dueDate',
            header: 'DUE DATE',
            cell: (info) => (
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{info.getValue()}</span>
                </div>
            )
        },
        {
            accessorKey: 'status',
            header: 'STATUS',
            cell: (info) => {
                const val = info.getValue();
                return (
                    <span className={clsx(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold w-fit",
                        val === 'Pending' ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {val === 'Pending' ? <Clock size={12} strokeWidth={3} /> : <CheckCircle2 size={12} strokeWidth={3} />}
                        {val}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            header: 'ACTIONS',
            cell: () => (
                <div className="flex items-center gap-4">
                    <button className="text-emerald-500 hover:text-emerald-600 transition-colors focus:outline-none bg-emerald-50 p-1.5 rounded-full">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                    </button>
                    <button className="text-red-400 hover:text-red-600 transition-colors focus:outline-none bg-red-50 p-1.5 rounded-full">
                        <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                </div>
            )
        }
    ];

    const data = [
        {
            id: 1,
            title: 'Submit Daily Work Log & Progress Report',
            description: 'Draft and submit the weekly progress update to the project manager.',
            priority: 'Important',
            dueDate: '3 Jun 2026',
            status: 'Pending'
        },
        {
            id: 2,
            title: 'Review Design Specifications for HRMS Portal',
            description: 'Go through the new Figma designs for employee onboarding flow.',
            priority: 'Basic',
            dueDate: '3 Jun 2026',
            status: 'Pending'
        },
        {
            id: 3,
            title: 'Update Client Credentials & Security Keys',
            description: 'Rotate API access keys and update documentation.',
            priority: 'Important',
            dueDate: '2 Jun 2026',
            status: 'Completed'
        },
        {
            id: 4,
            title: 'Prepare Slide Deck for Monthly Review Meet',
            description: 'Create summary slides highlighting milestones achieved.',
            priority: 'Basic',
            dueDate: '5 Jun 2026',
            status: 'Pending'
        },
        {
            id: 5,
            title: 'Align with QA Team on Pending Bug Verification',
            description: 'Test resolved issues on staging before deployment.',
            priority: 'Basic',
            dueDate: '1 Jun 2026',
            status: 'Completed'
        },
        {
            id: 14,
            title: 'Submit Daily Work Log & Progress Report',
            description: 'Draft and submit the weekly progress update to the project manager.',
            priority: 'Important',
            dueDate: '3 Jun 2026',
            status: 'Pending'
        },
        {
            id: 13,
            title: 'Review Design Specifications for HRMS Portal',
            description: 'Go through the new Figma designs for employee onboarding flow.',
            priority: 'Basic',
            dueDate: '3 Jun 2026',
            status: 'Pending'
        },
        {
            id: 12,
            title: 'Update Client Credentials & Security Keys',
            description: 'Rotate API access keys and update documentation.',
            priority: 'Important',
            dueDate: '2 Jun 2026',
            status: 'Completed'
        },
        {
            id: 11,
            title: 'Prepare Slide Deck for Monthly Review Meet',
            description: 'Create summary slides highlighting milestones achieved.',
            priority: 'Basic',
            dueDate: '5 Jun 2026',
            status: 'Pending'
        },
        {
            id: 10,
            title: 'Align with QA Team on Pending Bug Verification',
            description: 'Test resolved issues on staging before deployment.',
            priority: 'Basic',
            dueDate: '1 Jun 2026',
            status: 'Completed'
        }
    ];

    const tabs = ['All', 'Pending', 'Completed', 'Deleted Tasks'];

    const topContent = (
        <>
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 overflow-x-auto w-full sm:w-auto shrink-0 custom-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === tab
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
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
                    <p className="text-slate-500 mt-1.5 text-sm">View, prioritize and manage your tasks in a single view</p>
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
                    value="2"
                    icon={<Calendar size={22} />}
                    color="purple"
                    iconPosition="right"
                />
                <GenericCard
                    title="IMPORTANT TASK"
                    value="0"
                    icon={<Star size={22} />}
                    color="sky"
                    iconPosition="right"
                />
                <GenericCard
                    title="TODAY'S DUE TASK"
                    value="1"
                    icon={<Hourglass size={22} />}
                    color="yellow"
                    iconPosition="right"
                />
                <GenericCard
                    title="TOTAL PENDING"
                    value="2"
                    icon={<Clock size={22} />}
                    color="blue"
                    iconPosition="right"
                />
                <GenericCard
                    title="COMPLETED TASK"
                    value="3"
                    icon={<CheckCircle2 size={22} />}
                    color="green"
                    iconPosition="right"
                />
            </div>

            {/* Table Area */}
            <div className="flex-1 min-h-[520px]">
                <AdvancedDataTable
                    columns={columns}
                    data={data}
                    totalRecords={10}
                    pageCount={1}
                    pagination={pagination}
                    setPagination={setPagination}
                    topContent={topContent}
                />
            </div>
        </div>
    );
}
