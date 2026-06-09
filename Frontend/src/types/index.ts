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

export interface AttendanceSession {
  id: number;
  attendanceId: number;
  punchIn: string;
  punchOut: string | null;
  durationMinute: number;
}

export interface FormattedAttendance {
  id: number;
  attendanceId: number;   // raw DB id — used to fetch sessions on expand
  date: string;
  punchIn: string;
  punchOut: string;
  workingHours: string;
  totalMinutes: number;   // raw minutes — used for "Total Hours" display
  status: string;
}

// ─── Monthly Attendance ──────────────────────────────────────────────────────

export interface MonthlyStats {
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateIn: number;
  weekOffs: number;
  holidays: number;
  leaves: number;
  extraDays: number;
  pendingAttendance: number;
  rejectedAttendance: number;
  shortLeave: number;
  earlyOut: number;
  punchOutMissing: number;
  totalWorkedMin: number;
  targetMinutes: number;
  remainingMinutes: number;
  extraHoursMin: number;
  leaveHoursMin: number;
  adjustedHoursMin: number;
}

export type CalendarDayStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "WEEK_OFF";

export interface MonthlyAttendanceData {
  stats: MonthlyStats;
  calendarMap: Record<string, CalendarDayStatus>;
  daysInMonth: number;
}

// ─── Attendance Request ──────────────────────────────────────────────────────

export type AttendanceRequestStatus = "Approved" | "Pending" | "Declined";
export type AttendanceRequestType =
  | "PUNCH_IN_ADJUSTMENT"
  | "PUNCH_OUT_ADJUSTMENT"
  | "FULL_DAY_PRESENT"
  | "HALF_DAY_PRESENT"
  | "WORK_FROM_HOME"
  | "OTHER";

/** Raw shape returned by the API */
export interface AttendanceRequestRaw {
  id: number;
  employeeId: number;
  date: string;
  type: AttendanceRequestType;
  reason: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

/** Formatted for display in the table */
export interface AttendanceRequest {
  id: number;
  date: string;
  type: string;
  reason: string;
  status: AttendanceRequestStatus;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseStatus = "Paid" | "Pending" | "Unpaid" | "Rejected";
export type ExpenseType = "AMOUNT_WISE" | "UNIT_WISE";

/** Raw shape returned by the API */
export interface ExpenseRaw {
  id: number;
  expenseCode: string;
  employeeId: number;
  title: string;
  date: string;
  siteName: string;
  amount: string; // Decimal serialized as string by Prisma
  category: string;
  expenseType: ExpenseType;
  unit: string | null;
  unitRate: string | null;
  multiLevelApproval: string | null;
  status: "PENDING" | "PAID" | "UNPAID" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

/** Formatted for display in the table */
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
  // keep raw fields for edit/view modals
  _raw?: ExpenseRaw;
}

// ─── Advance Salary ──────────────────────────────────────────────────────────

export type AdvanceStatus = "Pending" | "Approved" | "Declined";

/** Raw shape returned by the API */
export interface AdvanceRequestRaw {
  id: number;
  employeeId: number;
  salaryMonth: string;   // e.g. "2025-08"
  amount: string;        // Decimal as string
  remark: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  declinedReason: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Formatted for display in the table */
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

// ─── Visit Management ────────────────────────────────────────────────────────

export type VisitCategory = "SELF" | "OTHER_EMPLOYEE" | "VISIT_WITH";
export type VisitPurpose =
  | "CLIENT_MEETING"
  | "SITE_INSPECTION"
  | "PRODUCT_DEMO"
  | "FOLLOW_UP"
  | "SUPPORT_VISIT"
  | "OTHER";
export type VisitScheduleType = "SCHEDULED" | "UNSCHEDULED";
export type VisitLocationMode = "PHYSICAL" | "VIRTUAL";
export type VisitStatusUi = "Scheduled" | "Completed" | "Cancelled";

export interface CustomerOption {
  id: number;
  name: string;
  code: string | null;
}

export interface VisitEmployeeRef {
  id: number;
  name: string;
}

/** Raw shape returned by the API */
export interface VisitRaw {
  id: number;
  employeeId: number;
  customerId: number;
  visitDate: string;
  purpose: VisitPurpose;
  scheduleType: VisitScheduleType;
  locationMode: VisitLocationMode;
  category: VisitCategory;
  companionEmployeeId: number | null;
  remarks: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  createdById: number;
  createdAt: string;
  updatedAt: string;
  employee: VisitEmployeeRef;
  customer: CustomerOption;
  companionEmployee: VisitEmployeeRef | null;
  createdBy: VisitEmployeeRef;
}

/** Formatted for display in the table */
export interface Visit {
  id: number;
  employeeName: string;
  customerName: string;
  visitDate: string;
  purpose: string;
  visitType: string;
  locationMode: string;
  category: string;
  companionName: string;
  remarks: string;
  status: VisitStatusUi;
  _raw?: VisitRaw;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface Employee {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Salary Slip ─────────────────────────────────────────────────────────────

export interface SalaryComponent {
  heading: string;
  amount: number;
}

export interface SalarySlipRaw {
  id: number;
  employeeId: number;
  salaryMonth: string;          // "YYYY-MM"
  department: string;
  designation: string;
  bankName: string;
  accountNo: string;
  panNo: string;
  salaryMode: string;
  monthWorkingDays: number;
  presentDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  joiningGrossSalary: string;   // Decimal as string
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: string;
  totalDeductions: string;
  netPay: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Loan Management ────────────────────────────────────────────────────────

export type LoanStatus = "Pending" | "Approved" | "Rejected" | "Disbursed" | "Repaid";

/** Raw shape returned by the API */
export interface LoanRequestRaw {
  id: number;
  employeeId: number;
  loanAmount: string;        // Decimal as string
  reason: string;
  repaymentPeriod: number;   // in months
  status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED" | "REPAID";
  approvedAmount: string | null;
  disbursedAmount: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  disbursedAt: string | null;
  repaidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Formatted for display in the table */
export interface LoanRequest {
  id: number;
  status: LoanStatus;
  requestedDate: string;
  loanAmount: string;
  reason: string;
  repaymentPeriod: number;
  approvedAmount: string;
  rejectionReason: string;
  approvedDate: string;
  disbursedDate: string;
  repaidDate: string;
}
