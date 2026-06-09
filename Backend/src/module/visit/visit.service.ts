import prisma from "../../config/prisma";
import {
  Prisma,
  VisitCategory,
  VisitLocationMode,
  VisitPurpose,
  VisitScheduleType,
  VisitStatus,
} from "@prisma/client";

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateVisitPayload {
  createdById: number;
  category: VisitCategory;
  employeeId: number;
  companionEmployeeId?: number;
  customerId: number;
  visitDate: string;
  purpose?: VisitPurpose;
  scheduleType?: VisitScheduleType;
  locationMode?: VisitLocationMode;
  remarks?: string;
}

export interface UpdateVisitPayload {
  customerId?: number;
  visitDate?: string;
  purpose?: VisitPurpose;
  scheduleType?: VisitScheduleType;
  locationMode?: VisitLocationMode;
  remarks?: string;
  status?: VisitStatus;
}

export interface GetVisitsQuery {
  employeeId: number;
  scope?: "my" | "team";
  pageIndex?: number | string;
  pageSize?: number | string;
  date?: string; // YYYY-MM-DD
}

const visitInclude = {
  employee: { select: { id: true, name: true } },
  customer: { select: { id: true, name: true, code: true } },
  companionEmployee: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.VisitInclude;

// ── Service Methods ──────────────────────────────────────────────────────────

export const getCustomers = async () => {
  return prisma.customer.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
};

export const createVisit = async (payload: CreateVisitPayload) => {
  const {
    createdById,
    category,
    employeeId,
    companionEmployeeId,
    customerId,
    visitDate,
    purpose = "CLIENT_MEETING",
    scheduleType = "SCHEDULED",
    locationMode = "PHYSICAL",
    remarks,
  } = payload;

  return prisma.visit.create({
    data: {
      createdById,
      category,
      employeeId,
      companionEmployeeId: companionEmployeeId ?? null,
      customerId,
      visitDate: new Date(visitDate),
      purpose,
      scheduleType,
      locationMode,
      remarks: remarks?.trim() || null,
      status: "SCHEDULED",
    },
    include: visitInclude,
  });
};

export const getVisits = async (query: GetVisitsQuery) => {
  const {
    employeeId,
    scope = "my",
    pageIndex = 0,
    pageSize = 10,
    date,
  } = query;

  const pageIdx = Number(pageIndex);
  const limit = Number(pageSize);
  const skip = pageIdx * limit;
  const empId = Number(employeeId);

  const where: Prisma.VisitWhereInput =
    scope === "team"
      ? {
          AND: [
            { employeeId: { not: empId } },
            {
              OR: [
                { companionEmployeeId: null },
                { companionEmployeeId: { not: empId } },
              ],
            },
          ],
        }
      : {
          OR: [
            { employeeId: empId },
            { companionEmployeeId: empId },
          ],
        };

  if (date) {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      const start = new Date(parsed);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsed);
      end.setHours(23, 59, 59, 999);
      where.visitDate = { gte: start, lte: end };
    }
  }

  const [data, total] = await Promise.all([
    prisma.visit.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ visitDate: "desc" }, { createdAt: "desc" }],
      include: visitInclude,
    }),
    prisma.visit.count({ where }),
  ]);

  return {
    data,
    pagination: { total, pageIndex: pageIdx, pageSize: limit },
  };
};

export const getVisitById = async (id: number) => {
  return prisma.visit.findUnique({
    where: { id },
    include: visitInclude,
  });
};

export const updateVisit = async (id: number, payload: UpdateVisitPayload) => {
  const updateData: Prisma.VisitUpdateInput = {};

  if (payload.customerId !== undefined) {
    updateData.customer = { connect: { id: payload.customerId } };
  }
  if (payload.visitDate !== undefined) {
    updateData.visitDate = new Date(payload.visitDate);
  }
  if (payload.purpose !== undefined) updateData.purpose = payload.purpose;
  if (payload.scheduleType !== undefined) {
    updateData.scheduleType = payload.scheduleType;
  }
  if (payload.locationMode !== undefined) {
    updateData.locationMode = payload.locationMode;
  }
  if (payload.remarks !== undefined) {
    updateData.remarks = payload.remarks?.trim() || null;
  }
  if (payload.status !== undefined) updateData.status = payload.status;

  return prisma.visit.update({
    where: { id },
    data: updateData,
    include: visitInclude,
  });
};

export const deleteVisit = async (id: number) => {
  return prisma.visit.delete({ where: { id } });
};

export const getMonthlyVisitCount = async (
  employeeId: number,
  month?: number | string,
  year?: number | string
) => {
  const now = new Date();
  const m = month ? Number(month) : now.getMonth() + 1;
  const y = year ? Number(year) : now.getFullYear();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  const empId = Number(employeeId);

  const count = await prisma.visit.count({
    where: {
      OR: [{ employeeId: empId }, { companionEmployeeId: empId }],
      visitDate: { gte: start, lte: end },
    },
  });

  return { count, month: m, year: y };
};
