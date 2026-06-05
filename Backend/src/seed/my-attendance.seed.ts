import prisma from "../config/prisma";

interface AttendanceDay {
  date: string;
  firstPunchIn: string;
  lastPunchOut: string;
  totalMinutes: number;
}

async function main(): Promise<void> {
  console.log("Seeding...");

  // Employee
  const employee = await prisma.employee.upsert({
    where: { email: "raj@gmail.com" },
    update: {},
    create: {
      name: "Raj Sorthiya",
      email: "raj@gmail.com",
      password: "123456",
    },
  });

  const attendanceData: AttendanceDay[] = [
    { date: "2026-06-01", firstPunchIn: "2026-06-01T09:00:00", lastPunchOut: "2026-06-01T18:00:00", totalMinutes: 540 },
    { date: "2026-06-02", firstPunchIn: "2026-06-02T09:15:00", lastPunchOut: "2026-06-02T18:10:00", totalMinutes: 535 },
    { date: "2026-06-03", firstPunchIn: "2026-06-03T08:55:00", lastPunchOut: "2026-06-03T18:05:00", totalMinutes: 550 },
    { date: "2026-06-04", firstPunchIn: "2026-06-04T09:05:00", lastPunchOut: "2026-06-04T18:15:00", totalMinutes: 550 },
    { date: "2026-06-05", firstPunchIn: "2026-06-05T09:10:00", lastPunchOut: "2026-06-05T18:00:00", totalMinutes: 530 },
    { date: "2026-06-06", firstPunchIn: "2026-06-06T09:00:00", lastPunchOut: "2026-06-06T17:45:00", totalMinutes: 525 },
    { date: "2026-06-07", firstPunchIn: "2026-06-07T09:20:00", lastPunchOut: "2026-06-07T18:30:00", totalMinutes: 550 },
    { date: "2026-06-08", firstPunchIn: "2026-06-08T08:50:00", lastPunchOut: "2026-06-08T18:00:00", totalMinutes: 550 },
    { date: "2026-06-09", firstPunchIn: "2026-06-09T09:00:00", lastPunchOut: "2026-06-09T18:20:00", totalMinutes: 560 },
    { date: "2026-06-10", firstPunchIn: "2026-06-10T09:05:00", lastPunchOut: "2026-06-10T18:10:00", totalMinutes: 545 },
  ];

  for (const item of attendanceData) {
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        attendanceDate: new Date(item.date),
        firstPunchIn: new Date(item.firstPunchIn),
        lastPunchOut: new Date(item.lastPunchOut),
        totalMinutes: item.totalMinutes,
        status: "PRESENT",
      },
    });

    // Session 1
    await prisma.attendanceSession.create({
      data: {
        attendanceId: attendance.id,
        punchIn: new Date(`${item.date}T09:00:00`),
        punchOut: new Date(`${item.date}T13:00:00`),
        durationMinute: 240,
      },
    });

    // Session 2
    await prisma.attendanceSession.create({
      data: {
        attendanceId: attendance.id,
        punchIn: new Date(`${item.date}T14:00:00`),
        punchOut: new Date(`${item.date}T18:00:00`),
        durationMinute: 240,
      },
    });
  }

  console.log("Attendance Seeded Successfully");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
