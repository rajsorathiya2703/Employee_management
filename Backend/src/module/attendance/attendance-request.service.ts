import prisma from "../../config/prisma";
import { AttendanceRequestStatus, AttendanceRequestType } from "@prisma/client";

interface CreateAttendanceRequestPayload {
  employeeId: number;
  date: string; // ISO date string
  type: AttendanceRequestType;
  reason: string;
}

interface GetAttendanceRequestsQuery {
  employeeId: number;
  pageIndex?: number | string;
  pageSize?: number | string;
  status?: AttendanceRequestStatus;
}

export const createAttendanceRequest = async (
  payload: CreateAttendanceRequestPayload
) => {
  const { employeeId, date, type, reason } = payload;

  return prisma.attendanceRequest.create({
    data: {
      employeeId,
      date: new Date(date),
      type,
      reason,
      status: "PENDING",
    },
  });
};

export const getAttendanceRequests = async (
  query: GetAttendanceRequestsQuery
) => {
  const { employeeId, pageIndex = 0, pageSize = 10, status } = query;

  const pageIdx = Number(pageIndex);
  const limit = Number(pageSize);
  const skip = pageIdx * limit;

  const where = {
    employeeId: Number(employeeId),
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.attendanceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.attendanceRequest.count({ where }),
  ]);

  return {
    data,
    pagination: { total, pageIndex: pageIdx, pageSize: limit },
  };
};

export const updateAttendanceRequestStatus = async (
  id: number,
  status: AttendanceRequestStatus
) => {
  return prisma.attendanceRequest.update({
    where: { id },
    data: { status },
  });
};

export const deleteAttendanceRequest = async (id: number) => {
  return prisma.attendanceRequest.delete({ where: { id } });
};
