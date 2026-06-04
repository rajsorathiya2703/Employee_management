const prisma = require("../../config/prisma");

const createCircular = async (payload) => {
  return await prisma.circular.create({
    data: payload,
  });
};

const getAllCirculars = async (query) => {
  const {
    page = 1,
    limit = 9,
    search,
    month,
    fromDate,
    toDate,
  } = query;

  const where = {};

  if (search) {
    where.OR = [
      {
        circularTitle: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        circularDescription: {
          contains: search,
          mode: "insensitive",
        },
      },
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
    skip: (page - 1) * Number(limit),
    take: Number(limit),
    orderBy: {
      circularPostDate: "desc",
    },
  });

  const total = await prisma.circular.count({ where });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data,
  };
};

const getCircularById = async (id) => {
  return await prisma.circular.findUnique({
    where: { id },
  });
};

const updateCircular = async (id, payload) => {
  return await prisma.circular.update({
    where: { id },
    data: payload,
  });
};

const deleteCircular = async (id) => {
  return await prisma.circular.delete({
    where: { id },
  });
};

module.exports = {
  createCircular,
  getAllCirculars,
  getCircularById,
  updateCircular,
  deleteCircular,
};