import prisma from "../config/prisma";

async function main(): Promise<void> {
  console.log("Seeding attendance requests...");

  // Ensure the employee exists (same one used in attendance seed)
  const employee = await prisma.employee.upsert({
    where: { email: "raj@gmail.com" },
    update: {},
    create: {
      name: "Raj Sorthiya",
      email: "raj@gmail.com",
      password: "123456",
    },
  });

  await prisma.attendanceRequest.createMany({
    data: [
      {
        employeeId: employee.id,
        date: new Date("2026-05-24"),
        type: "PUNCH_OUT_ADJUSTMENT",
        reason: "Fingerprint scanner mismatch on punch-out",
        status: "APPROVED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-05-18"),
        type: "FULL_DAY_PRESENT",
        reason: "Official client visit offsite — attendance not marked",
        status: "PENDING",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-05-12"),
        type: "PUNCH_IN_ADJUSTMENT",
        reason: "System outage at office; biometric device was offline",
        status: "APPROVED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-05-08"),
        type: "WORK_FROM_HOME",
        reason: "Power cut at office; worked remotely with manager approval",
        status: "DECLINED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-05-05"),
        type: "HALF_DAY_PRESENT",
        reason: "Medical appointment in the morning; joined office post-lunch",
        status: "APPROVED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-04-30"),
        type: "FULL_DAY_PRESENT",
        reason: "Attended company event at external venue; badge scan unavailable",
        status: "APPROVED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-04-25"),
        type: "PUNCH_OUT_ADJUSTMENT",
        reason: "Left early due to family emergency; punch-out not recorded",
        status: "PENDING",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-04-22"),
        type: "OTHER",
        reason: "Card reader malfunction at gate; manually logged entry with security",
        status: "PENDING",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-04-18"),
        type: "WORK_FROM_HOME",
        reason: "Heavy rainfall; roads blocked; worked from home with prior intimation",
        status: "APPROVED",
      },
      {
        employeeId: employee.id,
        date: new Date("2026-04-10"),
        type: "HALF_DAY_PRESENT",
        reason: "Attended government office for documentation; returned post lunch",
        status: "DECLINED",
      },
    ],
  });

  console.log("Attendance requests seeded successfully ✓");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
