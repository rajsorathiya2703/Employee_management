import prisma from "../config/prisma";
import { Prisma } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────────────────────

const dec = (n: number) => new Prisma.Decimal(n);

function buildSlip(params: {
  employeeId: number;
  salaryMonth: string;           // "YYYY-MM"
  department: string;
  designation: string;
  bankName: string;
  accountNo: string;
  panNo: string;
  monthWorkingDays: number;
  presentDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  joiningGrossSalary: number;
  earnings: { heading: string; amount: number }[];
  deductions: { heading: string; amount: number }[];
}) {
  const grossSalary = params.earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = params.deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = grossSalary - totalDeductions;

  return {
    employeeId: params.employeeId,
    salaryMonth: params.salaryMonth,
    department: params.department,
    designation: params.designation,
    bankName: params.bankName,
    accountNo: params.accountNo,
    panNo: params.panNo,
    salaryMode: "Bank Transfer",
    monthWorkingDays: params.monthWorkingDays,
    presentDays: params.presentDays,
    paidLeaves: params.paidLeaves,
    unpaidLeaves: params.unpaidLeaves,
    joiningGrossSalary: dec(params.joiningGrossSalary),
    earnings: params.earnings as unknown as Prisma.InputJsonValue,
    deductions: params.deductions as unknown as Prisma.InputJsonValue,
    grossSalary: dec(grossSalary),
    totalDeductions: dec(totalDeductions),
    netPay: dec(netPay),
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Seeding salary slips...");

  const employees = await prisma.employee.findMany({
    select: { id: true, email: true, name: true },
  });

  for (const emp of employees) {
    const existing = await prisma.salarySlip.count({
      where: { employeeId: emp.id },
    });
    if (existing > 0) {
      console.log(`  ↳ Skipping ${emp.email} — already has salary slip data`);
      continue;
    }

    // ── raj@gmail.com ───────────────────────────────────────────────────────
    if (emp.email === "raj@gmail.com") {
      const slips = [
        // May-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-05",
          department: "Engineering",
          designation: "Software Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 26,
          presentDays: 25,
          paidLeaves: 1,
          unpaidLeaves: 0,
          joiningGrossSalary: 30000,
          earnings: [
            { heading: "Basic",               amount: 12000 },
            { heading: "HRA",                 amount: 4800  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Incentive Allowance", amount: 3000  },
            { heading: "Special Allowances",  amount: 7996  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200 },
            { heading: "PF Deduction",     amount: 1935 },
          ],
        }),

        // April-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-04",
          department: "Engineering",
          designation: "Software Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 26,
          presentDays: 12,
          paidLeaves: 2,
          unpaidLeaves: 12,
          joiningGrossSalary: 25000,
          earnings: [
            { heading: "Basic",               amount: 3500 },
            { heading: "HRA",                 amount: 1400 },
            { heading: "Conveyance Allowance",amount: 2000 },
            { heading: "Incentive Allowance", amount: 3000 },
            { heading: "Paid Leave Allowance",amount: 196  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200 },
          ],
        }),

        // March-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-03",
          department: "Engineering",
          designation: "Software Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 26,
          presentDays: 24,
          paidLeaves: 2,
          unpaidLeaves: 0,
          joiningGrossSalary: 30000,
          earnings: [
            { heading: "Basic",               amount: 11077 },
            { heading: "HRA",                 amount: 4430  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Incentive Allowance", amount: 3000  },
            { heading: "Special Allowances",  amount: 7381  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1800 },
          ],
        }),

        // February-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-02",
          department: "Engineering",
          designation: "Software Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 24,
          presentDays: 24,
          paidLeaves: 0,
          unpaidLeaves: 0,
          joiningGrossSalary: 30000,
          earnings: [
            { heading: "Basic",               amount: 12000 },
            { heading: "HRA",                 amount: 4800  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Incentive Allowance", amount: 3000  },
            { heading: "Special Allowances",  amount: 8200  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1935 },
          ],
        }),

        // January-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-01",
          department: "Engineering",
          designation: "Software Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 27,
          presentDays: 27,
          paidLeaves: 0,
          unpaidLeaves: 0,
          joiningGrossSalary: 30000,
          earnings: [
            { heading: "Basic",               amount: 12000 },
            { heading: "HRA",                 amount: 4800  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Incentive Allowance", amount: 3000  },
            { heading: "Special Allowances",  amount: 8200  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1935 },
          ],
        }),

        // December-2025
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2025-12",
          department: "Engineering",
          designation: "Junior Developer",
          bankName: "HDFC Bank",
          accountNo: "XXXX-XXXX-1234",
          panNo: "ABCDE1234F",
          monthWorkingDays: 26,
          presentDays: 26,
          paidLeaves: 0,
          unpaidLeaves: 0,
          joiningGrossSalary: 25000,
          earnings: [
            { heading: "Basic",               amount: 10000 },
            { heading: "HRA",                 amount: 4000  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Incentive Allowance", amount: 3000  },
            { heading: "Special Allowances",  amount: 6000  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1620 },
          ],
        }),
      ];

      for (const slip of slips) {
        await prisma.salarySlip.upsert({
          where: {
            employeeId_salaryMonth: {
              employeeId: slip.employeeId,
              salaryMonth: slip.salaryMonth,
            },
          },
          update: {},   // already exists — skip
          create: slip,
        });
      }
      console.log(`  ✓ Seeded 6 salary slips for ${emp.email}`);
    }

    // ── priya@gmail.com ─────────────────────────────────────────────────────
    if (emp.email === "priya@gmail.com") {
      const slips = [
        // May-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-05",
          department: "Human Resources",
          designation: "HR Executive",
          bankName: "ICICI Bank",
          accountNo: "XXXX-XXXX-5678",
          panNo: "PQRST9876G",
          monthWorkingDays: 26,
          presentDays: 26,
          paidLeaves: 0,
          unpaidLeaves: 0,
          joiningGrossSalary: 28000,
          earnings: [
            { heading: "Basic",               amount: 11200 },
            { heading: "HRA",                 amount: 4480  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Special Allowances",  amount: 6320  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1814 },
          ],
        }),

        // April-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-04",
          department: "Human Resources",
          designation: "HR Executive",
          bankName: "ICICI Bank",
          accountNo: "XXXX-XXXX-5678",
          panNo: "PQRST9876G",
          monthWorkingDays: 26,
          presentDays: 24,
          paidLeaves: 2,
          unpaidLeaves: 0,
          joiningGrossSalary: 28000,
          earnings: [
            { heading: "Basic",               amount: 11200 },
            { heading: "HRA",                 amount: 4480  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Paid Leave Allowance",amount:  862  },
            { heading: "Special Allowances",  amount: 5458  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1814 },
          ],
        }),

        // March-2026
        buildSlip({
          employeeId: emp.id,
          salaryMonth: "2026-03",
          department: "Human Resources",
          designation: "HR Executive",
          bankName: "ICICI Bank",
          accountNo: "XXXX-XXXX-5678",
          panNo: "PQRST9876G",
          monthWorkingDays: 26,
          presentDays: 26,
          paidLeaves: 0,
          unpaidLeaves: 0,
          joiningGrossSalary: 28000,
          earnings: [
            { heading: "Basic",               amount: 11200 },
            { heading: "HRA",                 amount: 4480  },
            { heading: "Conveyance Allowance",amount: 2000  },
            { heading: "Special Allowances",  amount: 6320  },
          ],
          deductions: [
            { heading: "Professional Tax", amount: 200  },
            { heading: "PF Deduction",     amount: 1814 },
          ],
        }),
      ];

      for (const slip of slips) {
        await prisma.salarySlip.upsert({
          where: {
            employeeId_salaryMonth: {
              employeeId: slip.employeeId,
              salaryMonth: slip.salaryMonth,
            },
          },
          update: {},
          create: slip,
        });
      }
      console.log(`  ✓ Seeded 3 salary slips for ${emp.email}`);
    }
  }

  console.log("Salary slips seeded successfully ✓");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
