// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

// ─── Task ───────────────────────────────────────────────────────────────────

export type TaskPriority = "IMPORTANT" | "BASIC";
export type TaskStatus = "PENDING" | "COMPLETED" | "DELETED";

export interface Task {
  id: string;
  taskName: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Formatted task as displayed in the UI */
export interface FormattedTask extends Task {
  title: string;
}

export interface TaskDashboard {
  myDayTask: number;
  importantTask: number;
  todayDueTask: number;
  totalPending: number;
  completedTask: number;
}

// ─── Circular ───────────────────────────────────────────────────────────────

export interface Circular {
  id: string;
  circularTitle: string;
  circularDescription: string;
  circularPostDate: string;
  circularPostTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormattedCircular {
  id: string;
  title: string;
  date: string;
  body: string;
  fullBody: string;
}

// ─── Attendance ─────────────────────────────────────────────────────────────

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY";

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  attendanceDate: string;
  firstPunchIn: string | null;
  lastPunchOut: string | null;
  totalMinutes: number;
  status: AttendanceStatus;
}

export interface FormattedAttendance {
  id: number;
  date: string;
  punchIn: string;
  punchOut: string;
  workingHours: string;
  status: string;
}

// ─── Attendance Request ──────────────────────────────────────────────────────

export interface AttendanceRequest {
  id: number;
  date: string;
  type: string;
  reason: string;
  status: "Approved" | "Pending" | "Declined";
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseStatus = "Paid" | "Pending" | "Unpaid" | "Rejected";

export interface Expense {
  id: number;
  status: ExpenseStatus;
  multiLevelApproval: string;
  expenseId: string;
  title: string;
  date: string;
  siteName: string;
  amount: string;
  category: string;
  type: string;
  unit: string;
  unitRate: string;
}

// ─── Advance Salary ──────────────────────────────────────────────────────────

export type AdvanceStatus = "Pending" | "Approved" | "Declined";

export interface AdvanceRequest {
  id: number;
  status: AdvanceStatus;
  requestedDate: string;
  salaryMonth: string;
  amount: string;
  remark: string;
  declinedReason: string;
  resolvedDate: string;
}

export interface AdvanceHistory {
  id: number;
  amount: string;
  givenMode: string;
  givenDate: string;
  createdDate: string;
  remark: string;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
