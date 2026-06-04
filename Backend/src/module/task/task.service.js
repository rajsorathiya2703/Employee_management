const prisma = require("../../config/prisma");

const createTask = async (payload) => {
    return await prisma.task.create({
        data: payload,
    });
};

const getAllTasks = async (query) => {
    const {
        search,
        status,
        priority,
        page = 1,
        limit = 10,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {};

    if (search) {
        where.OR = [
            {
                taskName: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    if (status) {
        where.status = status;
    }

    if (priority) {
        where.priority = priority;
    }

    const [data, total] = await Promise.all([
        prisma.task.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.task.count({ where }),
    ]);

    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
        },
        data,
    };
};

const getSingleTask = async (id) => {
    return await prisma.task.findUnique({
        where: { id },
    });
};

const updateTask = async (id, payload) => {
    return await prisma.task.update({
        where: { id },
        data: payload,
    });
};

const completeTask = async (id) => {
    return await prisma.task.update({
        where: { id },
        data: {
            status: "COMPLETED",
        },
    });
};

const deleteTask = async (id) => {
    return await prisma.task.update({
        where: { id },
        data: {
            status: "DELETED",
        },
    });
};

const restoreTask = async (id) => {
    return await prisma.task.update({
        where: { id },
        data: {
            status: "PENDING",
        },
    });
};

const dashboardSummary = async () => {
    const today = new Date();

    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    const end = new Date(today);
    end.setHours(23, 59, 59, 999);

    const [
        importantTask,
        todayDueTask,
        totalPending,
        completedTask,
    ] = await Promise.all([
        prisma.task.count({
            where: {
                priority: "IMPORTANT",
                status: {
                    not: "DELETED",
                },
            },
        }),

        prisma.task.count({
            where: {
                dueDate: {
                    gte: start,
                    lte: end,
                },
                status: "PENDING",
            },
        }),

        prisma.task.count({
            where: {
                status: "PENDING",
            },
        }),

        prisma.task.count({
            where: {
                status: "COMPLETED",
            },
        }),
    ]);

    return {
        importantTask,
        todayDueTask,
        totalPending,
        completedTask,
    };
};

module.exports = {
    createTask,
    getAllTasks,
    getSingleTask,
    updateTask,
    completeTask,
    deleteTask,
    restoreTask,
    dashboardSummary,
};