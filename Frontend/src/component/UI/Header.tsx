import { useEffect, useRef, useState } from 'react';
import { PanelLeft, Bell, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../service/axios';

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen]);

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : 'U';

  return (
    <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 w-full">
      {/* Left */}
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

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-2.5 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-slate-400 rounded-full border border-white" />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-3 focus:outline-none group"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">
                {user?.name ?? 'Employee'}
              </p>
              <p className="text-xs text-slate-400 leading-tight">{user?.email ?? ''}</p>
            </div>
            {user?.profilePhoto ? (
              <img
                src={`${BACKEND_URL}${user.profilePhoto}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm group-hover:ring-2 group-hover:ring-blue-200 transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm select-none group-hover:ring-2 group-hover:ring-blue-200 transition-all">
                {initials}
              </div>
            )}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  {user?.name ?? 'Employee'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug truncate">
                  {user?.email ?? ''}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setMenuOpen(false); navigate('/employee/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                >
                  <User size={16} className="text-slate-400 shrink-0" />
                  My Profile
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                >
                  <Settings size={16} className="text-slate-400 shrink-0" />
                  Settings
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut size={16} className="shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
