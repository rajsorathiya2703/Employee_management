"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.getExpenseById = exports.getExpenses = exports.createExpense = void 0;
const service = __importStar(require("./expense.service"));
const client_1 = require("@prisma/client");
const VALID_EXPENSE_TYPES = Object.values(client_1.ExpenseType);
const VALID_STATUSES = Object.values(client_1.ExpenseStatus);
// ── Create ───────────────────────────────────────────────────────────────────
const createExpense = async (req, res) => {
    try {
        const { employeeId, title, date, siteName, amount, category, expenseType, unit, unitRate, multiLevelApproval, } = req.body;
        if (!employeeId || !title || !date || !siteName || !amount || !category) {
            res.status(400).json({
                success: false,
                message: "employeeId, title, date, siteName, amount, and category are required",
            });
            return;
        }
        if (expenseType && !VALID_EXPENSE_TYPES.includes(expenseType)) {
            res.status(400).json({
                success: false,
                message: `expenseType must be one of: ${VALID_EXPENSE_TYPES.join(", ")}`,
            });
            return;
        }
        const data = await service.createExpense({
            employeeId: Number(employeeId),
            title,
            date,
            siteName,
            amount: Number(amount),
            category,
            expenseType,
            unit,
            unitRate: unitRate != null ? Number(unitRate) : undefined,
            multiLevelApproval,
        });
        res.status(201).json({
            success: true,
            message: "Expense created successfully",
            data,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.createExpense = createExpense;
// ── Get All (employee-scoped, paginated) ─────────────────────────────────────
const getExpenses = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pageIndex = "0", pageSize = "10", status, month, year, } = req.query;
        if (status && !VALID_STATUSES.includes(status)) {
            res.status(400).json({
                success: false,
                message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
            });
            return;
        }
        const result = await service.getExpenses({
            employeeId: Number(employeeId),
            pageIndex,
            pageSize,
            status: status,
            month,
            year,
        });
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.getExpenses = getExpenses;
// ── Get Single ───────────────────────────────────────────────────────────────
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await service.getExpenseById(Number(id));
        if (!expense) {
            res.status(404).json({ success: false, message: "Expense not found" });
            return;
        }
        res.status(200).json({ success: true, data: expense });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.getExpenseById = getExpenseById;
// ── Update ───────────────────────────────────────────────────────────────────
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, date, siteName, amount, category, expenseType, unit, unitRate, multiLevelApproval, } = req.body;
        if (expenseType && !VALID_EXPENSE_TYPES.includes(expenseType)) {
            res.status(400).json({
                success: false,
                message: `expenseType must be one of: ${VALID_EXPENSE_TYPES.join(", ")}`,
            });
            return;
        }
        const data = await service.updateExpense(Number(id), {
            title,
            date,
            siteName,
            amount: amount != null ? Number(amount) : undefined,
            category,
            expenseType,
            unit,
            unitRate: unitRate != null ? Number(unitRate) : undefined,
            multiLevelApproval,
        });
        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.updateExpense = updateExpense;
// ── Delete ───────────────────────────────────────────────────────────────────
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify the expense exists first
        const existing = await service.getExpenseById(Number(id));
        if (!existing) {
            res.status(404).json({ success: false, message: "Expense not found" });
            return;
        }
        // Only PENDING expenses can be deleted by the employee
        if (existing.status !== "PENDING") {
            res.status(400).json({
                success: false,
                message: "Only pending expenses can be deleted",
            });
            return;
        }
        await service.deleteExpense(Number(id));
        res
            .status(200)
            .json({ success: true, message: "Expense deleted successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.deleteExpense = deleteExpense;
