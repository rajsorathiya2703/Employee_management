export declare const punchIn: (employeeId: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AttendanceStatus;
    createdAt: Date;
    updatedAt: Date;
    attendanceDate: Date;
    firstPunchIn: Date | null;
    lastPunchOut: Date | null;
    totalMinutes: number;
    employeeId: number;
}>;
export declare const punchOut: (employeeId: number) => Promise<boolean>;
export declare const getSessionsByAttendanceId: (attendanceId: number) => Promise<{
    id: number;
    createdAt: Date;
    attendanceId: number;
    punchIn: Date;
    punchOut: Date | null;
    durationMinute: number;
}[]>;
export declare const getMyAttendance: (employeeId: number) => Promise<{
    id: number;
    status: import(".prisma/client").$Enums.AttendanceStatus;
    createdAt: Date;
    updatedAt: Date;
    attendanceDate: Date;
    firstPunchIn: Date | null;
    lastPunchOut: Date | null;
    totalMinutes: number;
    employeeId: number;
}[]>;
export declare const getMonthlyAttendance: (employeeId: number, month: number, // 1-12
year: number) => Promise<{
    stats: {
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
    };
    calendarMap: Record<string, "PRESENT" | "ABSENT" | "HALF_DAY" | "WEEK_OFF">;
    daysInMonth: number;
}>;
export declare const getTodaySessions: (employeeId: number) => Promise<{
    isPunchedIn: boolean;
    sessions: never[];
    totalMinutes: number;
    activePunchIn?: undefined;
} | {
    isPunchedIn: boolean;
    activePunchIn: Date | null;
    sessions: {
        id: number;
        createdAt: Date;
        attendanceId: number;
        punchIn: Date;
        punchOut: Date | null;
        durationMinute: number;
    }[];
    totalMinutes: number;
}>;
