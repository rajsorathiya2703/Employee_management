"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodaySessions = exports.getMonthlyAttendance = exports.getMyAttendance = exports.getSessionsByAttendanceId = exports.punchOut = exports.punchIn = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const punchIn = async (employeeId) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let attendance = await prisma_1.default.attendance.findFirst({
        where: { employeeId, attendanceDate: today },
    });
    if (!attendance) {
        attendance = await prisma_1.default.attendance.create({
            data: { employeeId, attendanceDate: today, firstPunchIn: now },
        });
    }
    const activeSession = await prisma_1.default.attendanceSession.findFirst({
        where: { attendanceId: attendance.id, punchOut: null },
    });
    if (activeSession) {
        throw new Error("Already punched in");
    }
    await prisma_1.default.attendanceSession.create({
        data: { attendanceId: attendance.id, punchIn: now },
    });
    return attendance;
};
exports.punchIn = punchIn;
const punchOut = async (employeeId) => {
    const now = new Date();
    // Only look at today's attendance record, not the latest across all days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await prisma_1.default.attendance.findFirst({
        where: { employeeId, attendanceDate: today },
    });
    if (!attendance) {
        throw new Error("No attendance record found for today. Please punch in first.");
    }
    const session = await prisma_1.default.attendanceSession.findFirst({
        where: { attendanceId: attendance.id, punchOut: null },
        orderBy: { id: "desc" },
    });
    if (!session) {
        throw new Error("No active session found. You are not currently punched in.");
    }
    const durationMinute = Math.max(1, Math.floor((now.getTime() - new Date(session.punchIn).getTime()) / 1000 / 60));
    await prisma_1.default.attendanceSession.update({
        where: { id: session.id },
        data: { punchOut: now, durationMinute },
    });
    const sessions = await prisma_1.default.attendanceSession.findMany({
        where: { attendanceId: attendance.id },
    });
    const totalMinutes = sessions.reduce((sum, item) => sum + item.durationMinute, 0);
    await prisma_1.default.attendance.update({
        where: { id: attendance.id },
        data: { lastPunchOut: now, totalMinutes },
    });
    return true;
};
exports.punchOut = punchOut;
const getSessionsByAttendanceId = async (attendanceId) => {
    return prisma_1.default.attendanceSession.findMany({
        where: { attendanceId },
        orderBy: { id: "asc" },
    });
};
exports.getSessionsByAttendanceId = getSessionsByAttendanceId;
const getMyAttendance = async (employeeId) => {
    return prisma_1.default.attendance.findMany({
        where: { employeeId },
        orderBy: { attendanceDate: "desc" },
    });
};
exports.getMyAttendance = getMyAttendance;
const getMonthlyAttendance = async (employeeId, month, // 1-12
year) => {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 1); // exclusive upper bound
    // All attendance records for the month
    const records = await prisma_1.default.attendance.findMany({
        where: {
            employeeId,
            attendanceDate: { gte: from, lt: to },
        },
        orderBy: { attendanceDate: "asc" },
    });
    // ── derived stats ──────────────────────────────────────────────────────────
    const daysInMonth = new Date(year, month, 0).getDate();
    const presentDays = records.filter((r) => r.status === "PRESENT").length;
    const absentDays = records.filter((r) => r.status === "ABSENT").length;
    const totalWorkedMin = records.reduce((s, r) => s + r.totalMinutes, 0);
    // Working days = Mon–Fri count in the month
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
        const dow = new Date(year, month - 1, d).getDay();
        if (dow !== 0 && dow !== 6)
            workingDays++;
    }
    // Week-offs = Sat + Sun count
    const weekOffs = daysInMonth - workingDays;
    // Target minutes = working days × 8 h
    const targetMinutes = workingDays * 8 * 60;
    // Remaining minutes (can be negative if overtime)
    const remainingMinutes = Math.max(0, targetMinutes - totalWorkedMin);
    // Late-in: first punch-in after 09:30
    const lateInThreshold = 9 * 60 + 30; // minutes from midnight
    const lateInCount = records.filter((r) => {
        if (!r.firstPunchIn)
            return false;
        const d = new Date(r.firstPunchIn);
        return d.getHours() * 60 + d.getMinutes() > lateInThreshold;
    }).length;
    // Calendar map: "YYYY-MM-DD" → status
    const calendarMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month - 1, d);
        const key = dateObj.toISOString().split("T")[0];
        const dow = dateObj.getDay();
        if (dow === 0 || dow === 6) {
            calendarMap[key] = "WEEK_OFF";
        }
    }
    for (const r of records) {
        const key = new Date(r.attendanceDate).toISOString().split("T")[0];
        calendarMap[key] = r.status;
    }
    return {
        stats: {
            workingDays,
            presentDays,
            absentDays,
            lateIn: lateInCount,
            weekOffs,
            holidays: 0, // placeholder — wire to holiday table when available
            leaves: 0,
            extraDays: 0,
            pendingAttendance: 0,
            rejectedAttendance: 0,
            shortLeave: 0,
            earlyOut: 0,
            punchOutMissing: records.filter((r) => !r.lastPunchOut).length,
            totalWorkedMin,
            targetMinutes,
            remainingMinutes,
            extraHoursMin: Math.max(0, totalWorkedMin - targetMinutes),
            leaveHoursMin: 0,
            adjustedHoursMin: remainingMinutes,
        },
        calendarMap,
        daysInMonth,
    };
};
exports.getMonthlyAttendance = getMonthlyAttendance;
const getTodaySessions = async (employeeId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await prisma_1.default.attendance.findFirst({
        where: { employeeId, attendanceDate: today },
    });
    if (!attendance) {
        return { isPunchedIn: false, sessions: [], totalMinutes: 0 };
    }
    const sessions = await prisma_1.default.attendanceSession.findMany({
        where: { attendanceId: attendance.id },
        orderBy: { id: "asc" },
    });
    const activeSession = sessions.find((s) => s.punchOut === null);
    return {
        isPunchedIn: !!activeSession,
        activePunchIn: activeSession ? activeSession.punchIn : null,
        sessions,
        totalMinutes: attendance.totalMinutes,
    };
};
exports.getTodaySessions = getTodaySessions;
