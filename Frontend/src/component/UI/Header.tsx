import { PanelLeft, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Derive initials from name
  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';

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

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-400 rounded-full border border-white" />
        </button>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.name ?? 'Employee'}
            </p>
            <p className="text-xs text-slate-400 leading-tight">{user?.email ?? ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm select-none">
            {initials}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm bg-white focus:outline-none"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
