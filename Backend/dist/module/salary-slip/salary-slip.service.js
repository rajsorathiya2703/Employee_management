"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalarySlipByMonth = exports.getSalarySlipById = exports.getSalarySlipsByEmployee = exports.createSalarySlip = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
const createSalarySlip = async (payload) => {
    const { employeeId, salaryMonth, department = "", designation = "", bankName = "", accountNo = "", panNo = "", salaryMode = "Bank Transfer", monthWorkingDays = 0, presentDays = 0, paidLeaves = 0, unpaidLeaves = 0, joiningGrossSalary = 0, earnings, deductions, } = payload;
    const grossSalary = earnings.reduce((s, e) => s + e.amount, 0);
    const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0);
    const netPay = grossSalary - totalDeductions;
    return prisma_1.default.salarySlip.upsert({
        where: { employeeId_salaryMonth: { employeeId, salaryMonth } },
        update: {
            department, designation, bankName, accountNo, panNo, salaryMode,
            monthWorkingDays, presentDays, paidLeaves, unpaidLeaves,
            joiningGrossSalary: new client_1.Prisma.Decimal(joiningGrossSalary),
            earnings: earnings,
            deductions: deductions,
            grossSalary: new client_1.Prisma.Decimal(grossSalary),
            totalDeductions: new client_1.Prisma.Decimal(totalDeductions),
            netPay: new client_1.Prisma.Decimal(netPay),
        },
        create: {
            employeeId, salaryMonth, department, designation, bankName, accountNo, panNo, salaryMode,
            monthWorkingDays, presentDays, paidLeaves, unpaidLeaves,
            joiningGrossSalary: new client_1.Prisma.Decimal(joiningGrossSalary),
            earnings: earnings,
            deductions: deductions,
            grossSalary: new client_1.Prisma.Decimal(grossSalary),
            totalDeductions: new client_1.Prisma.Decimal(totalDeductions),
            netPay: new client_1.Prisma.Decimal(netPay),
        },
    });
};
exports.createSalarySlip = createSalarySlip;
const getSalarySlipsByEmployee = async (employeeId, year) => {
    const where = { employeeId };
    if (year) {
        where.salaryMonth = { startsWith: year };
    }
    return prisma_1.default.salarySlip.findMany({
        where,
        orderBy: { salaryMonth: "desc" },
    });
};
exports.getSalarySlipsByEmployee = getSalarySlipsByEmployee;
const getSalarySlipById = async (id) => {
    return prisma_1.default.salarySlip.findUnique({ where: { id } });
};
exports.getSalarySlipById = getSalarySlipById;
const getSalarySlipByMonth = async (employeeId, salaryMonth) => {
    return prisma_1.default.salarySlip.findUnique({
        where: { employeeId_salaryMonth: { employeeId, salaryMonth } },
    });
};
exports.getSalarySlipByMonth = getSalarySlipByMonth;
