import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const seedLoans = async () => {
  try {
    console.log("🌱 Seeding Loan requests...");

    // Get employee IDs
    const employees = await prisma.employee.findMany({
      select: { id: true },
      take: 5,
    });

    if (employees.length === 0) {
      console.log("❌ No employees found. Please seed employees first.");
      return;
    }

    // Create sample loan requests
    const loanData: Prisma.LoanRequestCreateInput[] = [
      {
        employee: { connect: { id: employees[0].id } },
        loanAmount: new Prisma.Decimal(100000),
        reason: "Need funds for home renovation and repairs",
        repaymentPeriod: 24,
        status: "APPROVED",
        approvedAmount: new Prisma.Decimal(95000),
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        employee: { connect: { id: employees[0].id } },
        loanAmount: new Prisma.Decimal(50000),
        reason: "Emergency medical expenses for family",
        repaymentPeriod: 12,
        status: "PENDING",
      },
      {
        employee: { connect: { id: employees[1].id } },
        loanAmount: new Prisma.Decimal(200000),
        reason: "Planning to purchase a vehicle for commute",
        repaymentPeriod: 36,
        status: "APPROVED",
        approvedAmount: new Prisma.Decimal(180000),
        approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        disbursedAmount: new Prisma.Decimal(180000),
        disbursedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        employee: { connect: { id: employees[1].id } },
        loanAmount: new Prisma.Decimal(75000),
        reason: "Child education expenses and tuition fees",
        repaymentPeriod: 18,
        status: "REJECTED",
        rejectionReason: "Salary does not meet minimum requirements for this amount",
        approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        employee: { connect: { id: employees[2].id } },
        loanAmount: new Prisma.Decimal(150000),
        reason: "Home down payment and purchase related expenses",
        repaymentPeriod: 48,
        status: "DISBURSED",
        approvedAmount: new Prisma.Decimal(150000),
        approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        disbursedAmount: new Prisma.Decimal(150000),
        disbursedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        employee: { connect: { id: employees[2].id } },
        loanAmount: new Prisma.Decimal(125000),
        reason: "Business startup investment for side venture",
        repaymentPeriod: 36,
        status: "PENDING",
      },
      {
        employee: { connect: { id: employees[3].id } },
        loanAmount: new Prisma.Decimal(80000),
        reason: "Festival season expenses and family gathering",
        repaymentPeriod: 12,
        status: "PENDING",
      },
      {
        employee: { connect: { id: employees[4].id } },
        loanAmount: new Prisma.Decimal(300000),
        reason: "Major home renovation and interior upgrade",
        repaymentPeriod: 60,
        status: "APPROVED",
        approvedAmount: new Prisma.Decimal(280000),
        approvedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        disbursedAmount: new Prisma.Decimal(280000),
        disbursedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        repaidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    // Delete existing loan requests for clean seed
    await prisma.loanRequest.deleteMany({});
    console.log("   Cleared existing loan records");

    // Create loans
    const createdLoans = await Promise.all(
      loanData.map((data) => prisma.loanRequest.create({ data }))
    );

    console.log(`✅ Seeded ${createdLoans.length} loan requests`);
  } catch (error) {
    console.error("❌ Error seeding loans:", error);
    throw error;
  }
};

export default seedLoans;
