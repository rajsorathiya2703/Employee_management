import prisma from "../../config/prisma";
import { Prisma } from "@prisma/client";

interface CircularQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  month?: string;
  fromDate?: string;
  toDate?: string;
}

export const createCircular = async (payload: Prisma.CircularCreateInput) => {
  return await prisma.circular.create({ data: payload });
};

export const getAllCirculars = async (query: CircularQuery) => {
  const { page = 1, limit = 9, search, month, fromDate, toDate } = query;

  const where: Prisma.CircularWhereInput = {};

  if (search) {
    where.OR = [
      { circularTitle: { contains: search } },
      { circularDescription: { contains: search } },
    ];
  }

  if (month) {
    const year = new Date().getFullYear();
    where.circularPostDate = {
      gte: new Date(year, Number(month) - 1, 1),
      lt: new Date(year, Number(month), 1),
    };
  }

  if (fromDate && toDate) {
    where.circularPostDate = {
      gte: new Date(fromDate),
      lte: new Date(toDate),
    };
  }

  const data = await prisma.circular.findMany({
    where,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { circularPostDate: "desc" },
  });

  const total = await prisma.circular.count({ where });

  return {
    meta: { page: Number(page), limit: Number(limit), total },
    data,
  };
};

export const getCircularById = async (id: string) => {
  return await prisma.circular.findUnique({ where: { id } });
};

export const updateCircular = async (
  id: string,
  payload: Prisma.CircularUpdateInput
) => {
  return await prisma.circular.update({ where: { id }, data: payload });
};

export const deleteCircular = async (id: string) => {
  return await prisma.circular.delete({ where: { id } });
};
