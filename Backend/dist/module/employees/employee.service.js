"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createEmployee = async (payload) => {
    return prisma_1.default.employee.create({ data: payload });
};
exports.createEmployee = createEmployee;
const getEmployees = async () => {
    return prisma_1.default.employee.findMany();
};
exports.getEmployees = getEmployees;
