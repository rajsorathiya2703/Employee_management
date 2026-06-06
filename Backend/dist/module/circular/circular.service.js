"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCircular = exports.updateCircular = exports.getCircularById = exports.getAllCirculars = exports.createCircular = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createCircular = async (payload) => {
    return await prisma_1.default.circular.create({ data: payload });
};
exports.createCircular = createCircular;
const getAllCirculars = async (query) => {
    const { page = 1, limit = 9, search, month, fromDate, toDate } = query;
    const where = {};
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
    const data = await prisma_1.default.circular.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { circularPostDate: "desc" },
    });
    const total = await prisma_1.default.circular.count({ where });
    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data,
    };
};
exports.getAllCirculars = getAllCirculars;
const getCircularById = async (id) => {
    return await prisma_1.default.circular.findUnique({ where: { id } });
};
exports.getCircularById = getCircularById;
const updateCircular = async (id, payload) => {
    return await prisma_1.default.circular.update({ where: { id }, data: payload });
};
exports.updateCircular = updateCircular;
const deleteCircular = async (id) => {
    return await prisma_1.default.circular.delete({ where: { id } });
};
exports.deleteCircular = deleteCircular;
