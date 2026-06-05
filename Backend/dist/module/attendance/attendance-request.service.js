"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendanceRequest = exports.updateAttendanceRequestStatus = exports.getAttendanceRequests = exports.createAttendanceRequest = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createAttendanceRequest = async (payload) => {
    const { employeeId, date, type, reason } = payload;
    return prisma_1.default.attendanceRequest.create({
        data: {
            employeeId,
            date: new Date(date),
            type,
            reason,
            status: "PENDING",
        },
    });
};
exports.createAttendanceRequest = createAttendanceRequest;
const getAttendanceRequests = async (query) => {
    const { employeeId, pageIndex = 0, pageSize = 10, status } = query;
    const pageIdx = Number(pageIndex);
    const limit = Number(pageSize);
    const skip = pageIdx * limit;
    const where = {
        employeeId: Number(employeeId),
        ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
        prisma_1.default.attendanceRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.attendanceRequest.count({ where }),
    ]);
    return {
        data,
        pagination: { total, pageIndex: pageIdx, pageSize: limit },
    };
};
exports.getAttendanceRequests = getAttendanceRequests;
const updateAttendanceRequestStatus = async (id, status) => {
    return prisma_1.default.attendanceRequest.update({
        where: { id },
        data: { status },
    });
};
exports.updateAttendanceRequestStatus = updateAttendanceRequestStatus;
const deleteAttendanceRequest = async (id) => {
    return prisma_1.default.attendanceRequest.delete({ where: { id } });
};
exports.deleteAttendanceRequest = deleteAttendanceRequest;
