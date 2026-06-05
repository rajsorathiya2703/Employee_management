import prisma from "../../config/prisma";

export const punchIn = async (employeeId: number) => {
  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await prisma.attendance.findFirst({
    where: { employeeId, attendanceDate: today },
  });

  if (!attendance) {
    attendance = await prisma.attendance.create({
      data: { employeeId, attendanceDate: today, firstPunchIn: now },
    });
  }

  const activeSession = await prisma.attendanceSession.findFirst({
    where: { attendanceId: attendance.id, punchOut: null },
  });

  if (activeSession) {
    throw new Error("Already punched in");
  }

  await prisma.attendanceSession.create({
    data: { attendanceId: attendance.id, punchIn: now },
  });

  return attendance;
};

export const punchOut = async (employeeId: number) => {
  const now = new Date();

  // Only look at today's attendance record, not the latest across all days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: { employeeId, attendanceDate: today },
  });

  if (!attendance) {
    throw new Error("No attendance record found for today. Please punch in first.");
  }

  const session = await prisma.attendanceSession.findFirst({
    where: { attendanceId: attendance.id, punchOut: null },
    orderBy: { id: "desc" },
  });

  if (!session) {
    throw new Error("No active session found. You are not currently punched in.");
  }

  const durationMinute = Math.max(
    1,
    Math.floor((now.getTime() - new Date(session.punchIn).getTime()) / 1000 / 60)
  );

  await prisma.attendanceSession.update({
    where: { id: session.id },
    data: { punchOut: now, durationMinute },
  });

  const sessions = await prisma.attendanceSession.findMany({
    where: { attendanceId: attendance.id },
  });

  const totalMinutes = sessions.reduce((sum, item) => sum + item.durationMinute, 0);

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: { lastPunchOut: now, totalMinutes },
  });

  return true;
};

export const getSessionsByAttendanceId = async (attendanceId: number) => {
  return prisma.attendanceSession.findMany({
    where: { attendanceId },
    orderBy: { id: "asc" },
  });
};

export const getMyAttendance = async (employeeId: number) => {
  return prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { attendanceDate: "desc" },
  });
};

export const getTodaySessions = async (employeeId: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: { employeeId, attendanceDate: today },
  });

  if (!attendance) {
    return { isPunchedIn: false, sessions: [], totalMinutes: 0 };
  }

  const sessions = await prisma.attendanceSession.findMany({
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
