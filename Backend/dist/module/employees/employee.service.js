"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileById = exports.getEmployees = exports.createEmployee = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createEmployee = async (payload) => {
    return prisma_1.default.employee.create({ data: payload });
};
exports.createEmployee = createEmployee;
const getEmployees = async () => {
    return prisma_1.default.employee.findMany();
};
exports.getEmployees = getEmployees;
// ── Profile ───────────────────────────────────────────────────────────────────
/** Safe subset returned to the client — never exposes password / tokens */
const PROFILE_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    personalEmail: true,
    designation: true,
    department: true,
    branch: true,
    dateOfJoining: true,
    profilePhoto: true,
    createdAt: true,
    updatedAt: true,
};
const getProfileById = async (id) => {
    return prisma_1.default.employee.findUnique({
        where: { id },
        select: PROFILE_SELECT,
    });
};
exports.getProfileById = getProfileById;
const updateProfile = async (id, payload) => {
    const { dateOfJoining, ...rest } = payload;
    return prisma_1.default.employee.update({
        where: { id },
        data: {
            ...rest,
            ...(dateOfJoining ? { dateOfJoining: new Date(dateOfJoining) } : {}),
        },
        select: PROFILE_SELECT,
    });
};
exports.updateProfile = updateProfile;
