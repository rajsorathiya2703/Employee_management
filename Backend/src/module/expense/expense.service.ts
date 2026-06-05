import prisma from "../../config/prisma";
import { ExpenseStatus, ExpenseType, Prisma } from "@prisma/client";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Generate a unique expense code like EXP4177 */
const generateExpenseCode = async (): Promise<string> => {
  const count = await prisma.expense.count();
  const code = `EXP${String(4000 + count + 1).padStart(4, "0")}`;
  return code;
};

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateExpensePayload {
  employeeId: number;
  title: string;
  date: string; // ISO string
  siteName: string;
  amount: number;
  category: string;
  expenseType?: ExpenseType;
  unit?: string;
  unitRate?: number;
  multiLevelApproval?: string;
}

export interface UpdateExpensePayload {
  title?: string;
  date?: string;
  siteName?: string;
  amount?: number;
  category?: string;
  expenseType?: ExpenseType;
  unit?: string;
  unitRate?: number;
  multiLevelApproval?: string;
}

export interface GetExpensesQuery {
  employeeId: number;
  pageIndex?: number | string;
  pageSize?: number | string;
  status?: ExpenseStatus;
  month?: number | string;
  year?: number | string;
}

// ── Service Methods ──────────────────────────────────────────────────────────

export const createExpense = async (payload: CreateExpensePayload) => {
  const {
    employeeId,
    title,
    date,
    siteName,
    amount,
    category,
    expenseType = "AMOUNT_WISE",
    unit,
    unitRate,
    multiLevelApproval,
  } = payload;

  const expenseCode = await generateExpenseCode();

  return prisma.expense.create({
    data: {
      expenseCode,
      employeeId,
      title,
      date: new Date(date),
      siteName,
      amount: new Prisma.Decimal(amount),
      category,
      expenseType,
      unit: unit ?? null,
      unitRate: unitRate != null ? new Prisma.Decimal(unitRate) : null,
      multiLevelApproval: multiLevelApproval ?? null,
      status: "PENDING",
    },
  });
};

export const getExpenses = async (query: GetExpensesQuery) => {
  const {
    employeeId,
    pageIndex = 0,
    pageSize = 10,
    status,
    month,
    year,
  } = query;

  const pageIdx = Number(pageIndex);
  const limit = Number(pageSize);
  const skip = pageIdx * limit;

  const where: Prisma.ExpenseWhereInput = {
    employeeId: Number(employeeId),
    ...(status ? { status } : {}),
  };

  // Month/year filter
  if (month && year) {
    const m = Number(month);
    const y = Number(year);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    where.date = { gte: start, lte: end };
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.count({ where }),
  ]);

  // Total amount for the filtered set (all records, not just current page)
  const totalAmountAgg = await prisma.expense.aggregate({
    where,
    _sum: { amount: true },
  });

  const totalAmount = totalAmountAgg._sum.amount
    ? Number(totalAmountAgg._sum.amount)
    : 0;

  return {
    data,
    pagination: { total, pageIndex: pageIdx, pageSize: limit },
    totalAmount,
  };
};

export const getExpenseById = async (id: number) => {
  return prisma.expense.findUnique({ where: { id } });
};

export const updateExpense = async (
  id: number,
  payload: UpdateExpensePayload
) => {
  const updateData: Prisma.ExpenseUpdateInput = {};

  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.date !== undefined) updateData.date = new Date(payload.date);
  if (payload.siteName !== undefined) updateData.siteName = payload.siteName;
  if (payload.amount !== undefined)
    updateData.amount = new Prisma.Decimal(payload.amount);
  if (payload.category !== undefined) updateData.category = payload.category;
  if (payload.expenseType !== undefined)
    updateData.expenseType = payload.expenseType;
  if (payload.unit !== undefined) updateData.unit = payload.unit;
  if (payload.unitRate !== undefined)
    updateData.unitRate =
      payload.unitRate != null ? new Prisma.Decimal(payload.unitRate) : null;
  if (payload.multiLevelApproval !== undefined)
    updateData.multiLevelApproval = payload.multiLevelApproval;

  return prisma.expense.update({ where: { id }, data: updateData });
};

export const deleteExpense = async (id: number) => {
  return prisma.expense.delete({ where: { id } });
};
