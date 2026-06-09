import { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './component/UI/Sidebar';
import Header from './component/UI/Header';
import ProtectedRoute from './component/common/ProtectedRoute';
import LoginPage from './pages/auth/login/page';
import Dashboard from './pages/page';
import TaskManagement from './pages/task-management/page';
import Circulars from './pages/circulars/page';
import AttendanceRequests from './pages/attendance/attendence-request/page';
import MyAttendance from './pages/attendance/my-attendence/page';
import MonthlyAttendance from './pages/attendance/monthely-attendence/page';
import MyExpenses from './pages/my-expenses/page';
import ApplyAdvance from './pages/advance-salary/apply-advace/page';
import AdvanceHistory from './pages/advance-salary/advanc-history/page';
import SalarySlipPage from './pages/salary-slip/page';
import MyProfilePage from './pages/profile/page';
import VisitManagement from './pages/visit-management/page';
import ApplyLoan from './pages/loan/apply-loan/page';
import LoanHistory from './pages/loan/loan-history/page';

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
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — wrapped in ProtectedRoute */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="employee/dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="circulars" element={<Circulars />} />
          <Route path="employee/attendance/my" element={<MyAttendance />} />
          <Route path="employee/attendance/monthly" element={<MonthlyAttendance />} />
          <Route path="employee/attendance/requests" element={<AttendanceRequests />} />
          <Route path="employee/expenses" element={<MyExpenses />} />
          <Route path="employee/advance-salary/apply" element={<ApplyAdvance />} />
          <Route path="employee/advance-salary/history" element={<AdvanceHistory />} />
          <Route path="employee/salary-slip" element={<SalarySlipPage />} />
          <Route path="employee/profile" element={<MyProfilePage />} />
          <Route path="employee/visits" element={<VisitManagement />} />
          <Route path="loan/apply" element={<ApplyLoan />} />
          <Route path="loan/history" element={<LoanHistory />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
