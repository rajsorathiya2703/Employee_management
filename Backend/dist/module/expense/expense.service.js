"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createExpense = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
// ── Helpers ──────────────────────────────────────────────────────────────────
/** Generate a unique expense code like EXP4177 */
const generateExpenseCode = async () => {
    const count = await prisma_1.default.expense.count();
    const code = `EXP${String(4000 + count + 1).padStart(4, "0")}`;
    return code;
};
// ── Service Methods ──────────────────────────────────────────────────────────
const createExpense = async (payload) => {
    const { employeeId, title, date, siteName, amount, category, expenseType = "AMOUNT_WISE", unit, unitRate, multiLevelApproval, } = payload;
    const expenseCode = await generateExpenseCode();
    return prisma_1.default.expense.create({
        data: {
            expenseCode,
            employeeId,
            title,
            date: new Date(date),
            siteName,
            amount: new client_1.Prisma.Decimal(amount),
            category,
            expenseType,
            unit: unit ?? null,
            unitRate: unitRate != null ? new client_1.Prisma.Decimal(unitRate) : null,
            multiLevelApproval: multiLevelApproval ?? null,
            status: "PENDING",
        },
    });
};
exports.createExpense = createExpense;
const getExpenses = async (query) => {
    const { employeeId, pageIndex = 0, pageSize = 10, status, month, year, } = query;
    const pageIdx = Number(pageIndex);
    const limit = Number(pageSize);
    const skip = pageIdx * limit;
    const where = {
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
        prisma_1.default.expense.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.expense.count({ where }),
    ]);
    // Total amount for the filtered set (all records, not just current page)
    const totalAmountAgg = await prisma_1.default.expense.aggregate({
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
exports.getExpenses = getExpenses;
const getExpenseById = async (id) => {
    return prisma_1.default.expense.findUnique({ where: { id } });
};
exports.getExpenseById = getExpenseById;
const updateExpense = async (id, payload) => {
    const updateData = {};
    if (payload.title !== undefined)
        updateData.title = payload.title;
    if (payload.date !== undefined)
        updateData.date = new Date(payload.date);
    if (payload.siteName !== undefined)
        updateData.siteName = payload.siteName;
    if (payload.amount !== undefined)
        updateData.amount = new client_1.Prisma.Decimal(payload.amount);
    if (payload.category !== undefined)
        updateData.category = payload.category;
    if (payload.expenseType !== undefined)
        updateData.expenseType = payload.expenseType;
    if (payload.unit !== undefined)
        updateData.unit = payload.unit;
    if (payload.unitRate !== undefined)
        updateData.unitRate =
            payload.unitRate != null ? new client_1.Prisma.Decimal(payload.unitRate) : null;
    if (payload.multiLevelApproval !== undefined)
        updateData.multiLevelApproval = payload.multiLevelApproval;
    return prisma_1.default.expense.update({ where: { id }, data: updateData });
};
exports.updateExpense = updateExpense;
const deleteExpense = async (id) => {
    return prisma_1.default.expense.delete({ where: { id } });
};
exports.deleteExpense = deleteExpense;
