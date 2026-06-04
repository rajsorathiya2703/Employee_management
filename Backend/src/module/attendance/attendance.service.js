const prisma = require("../../config/prisma");

const punchIn = async (employeeId) => {
  const now = new Date();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      attendanceDate: today,
    },
  });

  if (!attendance) {
    attendance = await prisma.attendance.create({
      data: {
        employeeId,
        attendanceDate: today,
        firstPunchIn: now,
      },
    });
  }

  const activeSession = await prisma.attendanceSession.findFirst({
    where: {
      attendanceId: attendance.id,
      punchOut: null,
    },
  });

  if (activeSession) {
    throw new Error("Already punched in");
  }

  await prisma.attendanceSession.create({
    data: {
      attendanceId: attendance.id,
      punchIn: now,
    },
  });

  return attendance;
};

const punchOut = async (employeeId) => {
  const now = new Date();

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
    },
    orderBy: {
      attendanceDate: "desc",
    },
  });

  if (!attendance) {
    throw new Error("Attendance not found");
  }

  const session = await prisma.attendanceSession.findFirst({
    where: {
      attendanceId: attendance.id,
      punchOut: null,
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!session) {
    throw new Error("No active session found");
  }

  const durationMinute = Math.floor(
    (now - new Date(session.punchIn)) / 1000 / 60
  );

  await prisma.attendanceSession.update({
    where: {
      id: session.id,
    },
    data: {
      punchOut: now,
      durationMinute,
    },
  });

  const sessions = await prisma.attendanceSession.findMany({
    where: {
      attendanceId: attendance.id,
    },
  });

  const totalMinutes = sessions.reduce(
    (sum, item) => sum + item.durationMinute,
    0
  );

  await prisma.attendance.update({
    where: {
      id: attendance.id,
    },
    data: {
      lastPunchOut: now,
      totalMinutes,
    },
  });

  return true;
};

const getMyAttendance = async (employeeId) => {
  return prisma.attendance.findMany({
    where: {
      employeeId,
    },
    orderBy: {
      attendanceDate: "desc",
    },
  });
};