import { useState } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './component/UI/Sidebar';
import Header from './component/UI/Header';
import TaskManagement from './pages/task-management/page';
import Circulars from './pages/circulars/page';
import AttendanceRequests from './pages/attendance/attendence-request/page';
import MyAttendance from './pages/attendance/my-attendence/page';
import MyExpenses from './pages/my-expenses/page';
import ApplyAdvance from './pages/advance-salary/apply-advace/page';
import AdvanceHistory from './pages/advance-salary/advanc-history/page';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <div className="p-4">
              <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            </div>
          }
        />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="circulars" element={<Circulars />} />
        <Route path="employee/attendance/my" element={<MyAttendance />} />
        <Route path="employee/attendance/requests" element={<AttendanceRequests />} />
        <Route path="employee/expenses" element={<MyExpenses />} />
        <Route path="employee/advance-salary/apply" element={<ApplyAdvance />} />
        <Route path="employee/advance-salary/history" element={<AdvanceHistory />} />
      </Route>
    </Routes>
  );
}
