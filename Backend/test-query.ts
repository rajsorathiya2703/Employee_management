import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const year = "2026";
    const employeeId = 3;
    const where: any = { employeeId };
    if (year) {
      where.salaryMonth = { startsWith: year };
    }
    console.log("Where:", where);
    const data = await prisma.salarySlip.findMany({
      where,
      orderBy: { salaryMonth: "desc" },
    });
    console.log("Data:", data);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
