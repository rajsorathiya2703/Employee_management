import prisma from "../../config/prisma";
import { AdvanceSalaryStatus, Prisma } from "@prisma/client";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CreateAdvancePayload {
  employeeId: number;
  salaryMonth: string; // "YYYY-MM"
  amount: number;
  remark: string;
}

export interface GetAdvanceQuery {
  employeeId: number;
  pageIndex?: number | string;
  pageSize?: number | string;
  status?: AdvanceSalaryStatus;
}

// ── Service Methods ───────────────────────────────────────────────────────────

export const createAdvanceRequest = async (payload: CreateAdvancePayload) => {
  const { employeeId, salaryMonth, amount, remark } = payload;

  // Prevent duplicate pending request for same salary month
  const existing = await prisma.advanceSalaryRequest.findFirst({
    where: {
      employeeId,
      salaryMonth,
      status: "PENDING",
    },
  });

  if (existing) {
    throw new Error(
      `A pending advance request for ${salaryMonth} already exists.`
    );
  }

  return prisma.advanceSalaryRequest.create({
    data: {
      employeeId,
      salaryMonth,
      amount: new Prisma.Decimal(amount),
      remark,
      status: "PENDING",
    },
  });
};

export const getAdvanceRequests = async (query: GetAdvanceQuery) => {
  const { employeeId, pageIndex = 0, pageSize = 10, status } = query;

  const pageIdx = Number(pageIndex);
  const limit = Number(pageSize);
  const skip = pageIdx * limit;

  const where: Prisma.AdvanceSalaryRequestWhereInput = {
    employeeId: Number(employeeId),
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.advanceSalaryRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.advanceSalaryRequest.count({ where }),
  ]);

  return {
    data,
    pagination: { total, pageIndex: pageIdx, pageSize: limit },
  };
};

export const getAdvanceRequestById = async (id: number) => {
  return prisma.advanceSalaryRequest.findUnique({ where: { id } });
};

export const deleteAdvanceRequest = async (id: number) => {
  return prisma.advanceSalaryRequest.delete({ where: { id } });
};
