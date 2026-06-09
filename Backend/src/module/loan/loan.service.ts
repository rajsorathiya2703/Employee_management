import prisma from "../../config/prisma";
import { LoanStatus, Prisma } from "@prisma/client";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CreateLoanPayload {
  employeeId: number;
  loanAmount: number;
  reason: string;
  repaymentPeriod: number; // in months
}

export interface ApproveLoanPayload {
  id: number;
  approvedAmount: number;
}

export interface RejectLoanPayload {
  id: number;
  rejectionReason: string;
}

export interface GetLoanQuery {
  employeeId: number;
  pageIndex?: number | string;
  pageSize?: number | string;
  status?: LoanStatus;
}

// ── Service Methods ───────────────────────────────────────────────────────────

export const createLoanRequest = async (payload: CreateLoanPayload) => {
  const { employeeId, loanAmount, reason, repaymentPeriod } = payload;

  // Prevent multiple pending requests from same employee
  const existing = await prisma.loanRequest.findFirst({
    where: {
      employeeId,
      status: "PENDING",
    },
  });

  if (existing) {
    throw new Error(
      `An employee already has a pending loan request. Please wait for approval or rejection.`
    );
  }

  return prisma.loanRequest.create({
    data: {
      employeeId,
      loanAmount: new Prisma.Decimal(loanAmount),
      reason: reason.trim(),
      repaymentPeriod: Number(repaymentPeriod),
      status: "PENDING",
    },
  });
};

export const getLoanRequests = async (query: GetLoanQuery) => {
  const { employeeId, pageIndex = 0, pageSize = 10, status } = query;

  const pageIdx = Number(pageIndex);
  const limit = Number(pageSize);
  const skip = pageIdx * limit;

  const where: Prisma.LoanRequestWhereInput = {
    employeeId: Number(employeeId),
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.loanRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.loanRequest.count({ where }),
  ]);

  return {
    data,
    pagination: { total, pageIndex: pageIdx, pageSize: limit },
  };
};

export const getLoanRequestById = async (id: number) => {
  return prisma.loanRequest.findUnique({ where: { id } });
};

export const approveLoanRequest = async (payload: ApproveLoanPayload) => {
  const { id, approvedAmount } = payload;

  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) {
    throw new Error("Loan request not found.");
  }

  if (loanRequest.status !== "PENDING") {
    throw new Error(
      `Cannot approve a loan that is not in PENDING status. Current status: ${loanRequest.status}`
    );
  }

  if (approvedAmount <= 0) {
    throw new Error("Approved amount must be greater than 0.");
  }

  return prisma.loanRequest.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAmount: new Prisma.Decimal(approvedAmount),
      approvedAt: new Date(),
    },
  });
};

export const rejectLoanRequest = async (payload: RejectLoanPayload) => {
  const { id, rejectionReason } = payload;

  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) {
    throw new Error("Loan request not found.");
  }

  if (loanRequest.status !== "PENDING") {
    throw new Error(
      `Cannot reject a loan that is not in PENDING status. Current status: ${loanRequest.status}`
    );
  }

  return prisma.loanRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
      approvedAt: new Date(),
    },
  });
};

export const disburseLoanRequest = async (id: number) => {
  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) {
    throw new Error("Loan request not found.");
  }

  if (loanRequest.status !== "APPROVED") {
    throw new Error(
      `Cannot disburse a loan that is not in APPROVED status. Current status: ${loanRequest.status}`
    );
  }

  return prisma.loanRequest.update({
    where: { id },
    data: {
      status: "DISBURSED",
      disbursedAmount: loanRequest.approvedAmount,
      disbursedAt: new Date(),
    },
  });
};

export const markLoanAsRepaid = async (id: number) => {
  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) {
    throw new Error("Loan request not found.");
  }

  if (loanRequest.status !== "DISBURSED") {
    throw new Error(
      `Cannot mark as repaid a loan that is not in DISBURSED status. Current status: ${loanRequest.status}`
    );
  }

  return prisma.loanRequest.update({
    where: { id },
    data: {
      status: "REPAID",
      repaidAt: new Date(),
    },
  });
};

export const deleteLoanRequest = async (id: number) => {
  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) {
    throw new Error("Loan request not found.");
  }

  if (loanRequest.status !== "PENDING") {
    throw new Error(
      `Cannot delete a loan that is not in PENDING status. Current status: ${loanRequest.status}`
    );
  }

  return prisma.loanRequest.delete({ where: { id } });
};
