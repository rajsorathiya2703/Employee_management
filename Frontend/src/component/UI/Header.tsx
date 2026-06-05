import { PanelLeft, Bell } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 w-full">
      <div className="flex items-center gap-5">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft size={20} className="text-slate-600" />
        </button>
        <div className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
          Employee Portal
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-400 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Raj Sorathiya</span>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm">
            RS
          </div>
        </div>
      </div>
    </header>
  );
}
