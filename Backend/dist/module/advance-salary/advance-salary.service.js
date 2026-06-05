"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvanceHistory = exports.deleteAdvanceRequest = exports.getAdvanceRequestById = exports.getAdvanceRequests = exports.createAdvanceRequest = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
// ── Service Methods ───────────────────────────────────────────────────────────
const createAdvanceRequest = async (payload) => {
    const { employeeId, salaryMonth, amount, remark } = payload;
    // Prevent duplicate pending request for same salary month
    const existing = await prisma_1.default.advanceSalaryRequest.findFirst({
        where: {
            employeeId,
            salaryMonth,
            status: "PENDING",
        },
    });
    if (existing) {
        throw new Error(`A pending advance request for ${salaryMonth} already exists.`);
    }
    return prisma_1.default.advanceSalaryRequest.create({
        data: {
            employeeId,
            salaryMonth,
            amount: new client_1.Prisma.Decimal(amount),
            remark,
            status: "PENDING",
        },
    });
};
exports.createAdvanceRequest = createAdvanceRequest;
const getAdvanceRequests = async (query) => {
    const { employeeId, pageIndex = 0, pageSize = 10, status } = query;
    const pageIdx = Number(pageIndex);
    const limit = Number(pageSize);
    const skip = pageIdx * limit;
    const where = {
        employeeId: Number(employeeId),
        ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
        prisma_1.default.advanceSalaryRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.advanceSalaryRequest.count({ where }),
    ]);
    return {
        data,
        pagination: { total, pageIndex: pageIdx, pageSize: limit },
    };
};
exports.getAdvanceRequests = getAdvanceRequests;
const getAdvanceRequestById = async (id) => {
    return prisma_1.default.advanceSalaryRequest.findUnique({ where: { id } });
};
exports.getAdvanceRequestById = getAdvanceRequestById;
const deleteAdvanceRequest = async (id) => {
    return prisma_1.default.advanceSalaryRequest.delete({ where: { id } });
};
exports.deleteAdvanceRequest = deleteAdvanceRequest;
const getAdvanceHistory = async (query) => {
    const { employeeId, pageIndex = 0, pageSize = 10 } = query;
    const pageIdx = Number(pageIndex);
    const limit = Number(pageSize);
    const skip = pageIdx * limit;
    const where = { employeeId: Number(employeeId) };
    const [data, total] = await Promise.all([
        prisma_1.default.advanceSalaryHistory.findMany({
            where,
            skip,
            take: limit,
            orderBy: { givenDate: "desc" },
        }),
        prisma_1.default.advanceSalaryHistory.count({ where }),
    ]);
    return {
        data,
        pagination: { total, pageIndex: pageIdx, pageSize: limit },
    };
};
exports.getAdvanceHistory = getAdvanceHistory;
