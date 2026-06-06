"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardSummary = exports.restoreTask = exports.deleteTask = exports.completeTask = exports.updateTask = exports.getSingleTask = exports.getAllTasks = exports.createTask = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createTask = async (payload) => {
    return await prisma_1.default.task.create({ data: payload });
};
exports.createTask = createTask;
const getAllTasks = async (query) => {
    const { search, status, priority, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (search) {
        where.OR = [
            { taskName: { contains: search } },
            { description: { contains: search } },
        ];
    }
    if (status) {
        where.status = status;
    }
    if (priority) {
        where.priority = priority;
    }
    const [data, total] = await Promise.all([
        prisma_1.default.task.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.default.task.count({ where }),
    ]);
    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data,
    };
};
exports.getAllTasks = getAllTasks;
const getSingleTask = async (id) => {
    return await prisma_1.default.task.findUnique({ where: { id } });
};
exports.getSingleTask = getSingleTask;
const updateTask = async (id, payload) => {
    return await prisma_1.default.task.update({ where: { id }, data: payload });
};
exports.updateTask = updateTask;
const completeTask = async (id) => {
    return await prisma_1.default.task.update({
        where: { id },
        data: { status: "COMPLETED" },
    });
};
exports.completeTask = completeTask;
const deleteTask = async (id) => {
    return await prisma_1.default.task.update({
        where: { id },
        data: { status: "DELETED" },
    });
};
exports.deleteTask = deleteTask;
const restoreTask = async (id) => {
    return await prisma_1.default.task.update({
        where: { id },
        data: { status: "PENDING" },
    });
};
exports.restoreTask = restoreTask;
const dashboardSummary = async () => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    const [importantTask, todayDueTask, totalPending, completedTask] = await Promise.all([
        prisma_1.default.task.count({
            where: { priority: "IMPORTANT", status: { not: "DELETED" } },
        }),
        prisma_1.default.task.count({
            where: { dueDate: { gte: start, lte: end }, status: "PENDING" },
        }),
        prisma_1.default.task.count({ where: { status: "PENDING" } }),
        prisma_1.default.task.count({ where: { status: "COMPLETED" } }),
    ]);
    return { importantTask, todayDueTask, totalPending, completedTask };
};
exports.dashboardSummary = dashboardSummary;
