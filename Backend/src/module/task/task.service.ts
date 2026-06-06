import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";

interface TaskQuery {
  search?: string;
  status?: string;
  priority?: string;
  page?: number | string;
  limit?: number | string;
}

export const createTask = async (payload: Prisma.TaskCreateInput) => {
  return await prisma.task.create({ data: payload });
};

export const getAllTasks = async (query: TaskQuery) => {
  const { search, status, priority, page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: Prisma.TaskWhereInput = {};

  if (search) {
    where.OR = [
      { taskName: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (status) {
    where.status = status as Prisma.EnumTaskStatusFilter;
  }

  if (priority) {
    where.priority = priority as Prisma.EnumTaskPriorityFilter;
  }

  const [data, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    meta: { page: Number(page), limit: Number(limit), total },
    data,
  };
};

export const getSingleTask = async (id: string) => {
  return await prisma.task.findUnique({ where: { id } });
};

export const updateTask = async (id: string, payload: Prisma.TaskUpdateInput) => {
  return await prisma.task.update({ where: { id }, data: payload });
};

export const completeTask = async (id: string) => {
  return await prisma.task.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
};

export const deleteTask = async (id: string) => {
  return await prisma.task.update({
    where: { id },
    data: { status: "DELETED" },
  });
};

export const restoreTask = async (id: string) => {
  return await prisma.task.update({
    where: { id },
    data: { status: "PENDING" },
  });
};

export const dashboardSummary = async () => {
  const today = new Date();

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const [importantTask, todayDueTask, totalPending, completedTask] =
    await Promise.all([
      prisma.task.count({
        where: { priority: "IMPORTANT", status: { not: "DELETED" } },
      }),
      prisma.task.count({
        where: { dueDate: { gte: start, lte: end }, status: "PENDING" },
      }),
      prisma.task.count({ where: { status: "PENDING" } }),
      prisma.task.count({ where: { status: "COMPLETED" } }),
    ]);

  return { importantTask, todayDueTask, totalPending, completedTask };
};
