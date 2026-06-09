import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  ListTodo,
  FileText,
  ClipboardCheck,
  Receipt,
  Landmark,
  CreditCard,
  FileSpreadsheet,
  MapPin,
  ChevronRight,
  ChevronDown,
  Building2,
  Circle,
  LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import bgImage from '../../assets/Sidebar_bg.png';
import logoImage from '../../assets/Sidebar_logo.png';

interface SubItem {
  name: string;
  path: string;
}

interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  isCompany?: boolean;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
}

const navItems: NavItem[] = [
  { name: 'MineHR Solutions pvt ltd', icon: Building2, path: '#', isCompany: true },
  { name: 'Dashboard', icon: LayoutGrid, path: '/employee/dashboard' },
  { name: 'Task Management', icon: ListTodo, path: '/tasks' },
  { name: 'Circulars', icon: FileText, path: '/circulars' },
  {
    name: 'Attendance',
    icon: ClipboardCheck,
    path: '/employee/attendance',
    hasSubmenu: true,
    subItems: [
      { name: 'My Attendance', path: '/employee/attendance/my' },
      { name: 'Monthly Attendance', path: '/employee/attendance/monthly' },
      { name: 'Attendance Requests', path: '/employee/attendance/requests' },
    ],
  },
  { name: 'My Expenses', icon: Receipt, path: '/employee/expenses' },
  {
    name: 'Loan',
    icon: Landmark,
    path: '/loan',
    hasSubmenu: true,
    subItems: [
      { name: 'Apply Loan', path: '/loan/apply' },
      { name: 'Loan History', path: '/loan/history' },
    ],
  },
  {
    name: 'Advance Salary',
    icon: CreditCard,
    path: '/employee/advance-salary',
    hasSubmenu: true,
    subItems: [
      { name: 'Apply Advance', path: '/employee/advance-salary/apply' },
      { name: 'Advance History', path: '/employee/advance-salary/history' },
    ],
  },
  { name: 'Salary Slip', icon: FileSpreadsheet, path: '/employee/salary-slip' },
  { name: 'Visit Management', icon: MapPin, path: '/employee/visits' },
];

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Attendance: location.pathname.includes('/attendance'),
  });

  const toggleSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={clsx(
        'h-screen flex flex-col transition-all duration-300 overflow-hidden relative text-white z-30 shrink-0',
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      )}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1c2438',
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-center h-28 shrink-0 overflow-hidden w-full">
          <div
            className={clsx(
              'transition-all duration-300 flex items-center',
              isOpen ? 'w-52 px-6' : 'w-12 justify-center'
            )}
          >
            <img
              src={logoImage}
              alt="MineHR Solutions"
              className={clsx(
                'transition-all duration-300 max-w-none',
                isOpen
                  ? 'h-auto w-full object-contain'
                  : 'h-10 w-10 object-cover object-left rounded-md'
              )}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => {
            const isParentActive =
              location.pathname.startsWith(item.path) && item.path !== '/';
            const isExactActive =
              location.pathname === item.path ||
              (item.path === '/employee/dashboard' && location.pathname === '/');
            const isActive = isExactActive || isParentActive;
            const Icon = item.icon;
            const isMenuOpen = openMenus[item.name];

            if (item.isCompany) {
              if (!isOpen) return null;
              return (
                <div key={item.name} className="mb-4 mx-1">
                  <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5 border border-white/5 shadow-sm">
                    <Icon size={20} className="text-slate-300 shrink-0" />
                    <span className="font-semibold text-sm text-slate-100 whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.name} className="flex flex-col">
                <Link
                  to={item.hasSubmenu ? '#' : item.path}
                  onClick={(e) =>
                    item.hasSubmenu ? toggleSubmenu(item.name, e) : undefined
                  }
                  title={!isOpen ? item.name : undefined}
                  className={clsx(
                    'flex items-center rounded-xl transition-all duration-200 group mx-1',
                    isOpen ? 'justify-between p-3.5' : 'justify-center p-3 mb-1',
                    isActive
                      ? 'bg-white/15 text-white border border-white/10 shadow-sm'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  )}
                >
                  <div
                    className={clsx(
                      'flex items-center',
                      isOpen ? 'gap-3' : 'justify-center'
                    )}
                  >
                    <Icon
                      size={isOpen ? 20 : 22}
                      className={clsx(
                        'shrink-0',
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    {isOpen && (
                      <span className="font-medium text-[15px] whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </div>
                  {item.hasSubmenu && isOpen && (
                    isMenuOpen ? (
                      <ChevronDown size={18} className="text-white" />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={
                          isActive
                            ? 'text-white'
                            : 'text-slate-500 group-hover:text-slate-300'
                        }
                      />
                    )
                  )}
                </Link>

                {item.hasSubmenu && isOpen && isMenuOpen && (
                  <div className="flex flex-col gap-1 mt-1 mb-2 ml-4 pl-4 border-l border-white/10">
                    {item.subItems?.map((sub) => {
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={clsx(
                            'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                            isSubActive
                              ? 'bg-white/10 text-white font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          )}
                        >
                          <Circle
                            size={8}
                            className={
                              isSubActive
                                ? 'fill-indigo-400 text-indigo-400'
                                : 'text-slate-600'
                            }
                          />
                          <span className="whitespace-nowrap">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
