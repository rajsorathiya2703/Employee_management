import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";

export interface SalaryComponent {
  heading: string;
  amount: number;
}

export interface CreateSalarySlipPayload {
  employeeId: number;
  salaryMonth: string;
  department?: string;
  designation?: string;
  bankName?: string;
  accountNo?: string;
  panNo?: string;
  salaryMode?: string;
  monthWorkingDays?: number;
  presentDays?: number;
  paidLeaves?: number;
  unpaidLeaves?: number;
  joiningGrossSalary?: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

export const createSalarySlip = async (payload: CreateSalarySlipPayload) => {
  const {
    employeeId, salaryMonth, department = "", designation = "",
    bankName = "", accountNo = "", panNo = "", salaryMode = "Bank Transfer",
    monthWorkingDays = 0, presentDays = 0, paidLeaves = 0, unpaidLeaves = 0,
    joiningGrossSalary = 0, earnings, deductions,
  } = payload;

  const grossSalary = earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
  const netPay = grossSalary - totalDeductions;

  return prisma.salarySlip.upsert({
    where: { employeeId_salaryMonth: { employeeId, salaryMonth } },
    update: {
      department, designation, bankName, accountNo, panNo, salaryMode,
      monthWorkingDays, presentDays, paidLeaves, unpaidLeaves,
      joiningGrossSalary: new Prisma.Decimal(joiningGrossSalary),
      earnings: earnings as unknown as Prisma.InputJsonValue,
      deductions: deductions as unknown as Prisma.InputJsonValue,
      grossSalary: new Prisma.Decimal(grossSalary),
      totalDeductions: new Prisma.Decimal(totalDeductions),
      netPay: new Prisma.Decimal(netPay),
    },
    create: {
      employeeId, salaryMonth, department, designation, bankName, accountNo, panNo, salaryMode,
      monthWorkingDays, presentDays, paidLeaves, unpaidLeaves,
      joiningGrossSalary: new Prisma.Decimal(joiningGrossSalary),
      earnings: earnings as unknown as Prisma.InputJsonValue,
      deductions: deductions as unknown as Prisma.InputJsonValue,
      grossSalary: new Prisma.Decimal(grossSalary),
      totalDeductions: new Prisma.Decimal(totalDeductions),
      netPay: new Prisma.Decimal(netPay),
    },
  });
};

export const getSalarySlipsByEmployee = async (employeeId: number, year?: string) => {
  const where: Prisma.SalarySlipWhereInput = { employeeId };
  if (year) {
    where.salaryMonth = { startsWith: year };
  }
  return prisma.salarySlip.findMany({
    where,
    orderBy: { salaryMonth: "desc" },
  });
};

export const getSalarySlipById = async (id: number) => {
  return prisma.salarySlip.findUnique({ where: { id } });
};

export const getSalarySlipByMonth = async (employeeId: number, salaryMonth: string) => {
  return prisma.salarySlip.findUnique({
    where: { employeeId_salaryMonth: { employeeId, salaryMonth } },
  });
};
