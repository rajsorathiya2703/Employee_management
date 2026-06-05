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
exports.getAdvanceHistory = exports.deleteAdvanceRequest = exports.getAdvanceRequests = exports.createAdvanceRequest = void 0;
const service = __importStar(require("./advance-salary.service"));
const client_1 = require("@prisma/client");
const VALID_STATUSES = Object.values(client_1.AdvanceSalaryStatus);
// ── Create ────────────────────────────────────────────────────────────────────
const createAdvanceRequest = async (req, res) => {
    try {
        const { employeeId, salaryMonth, amount, remark } = req.body;
        if (!employeeId || !salaryMonth || !amount || !remark) {
            res.status(400).json({
                success: false,
                message: "employeeId, salaryMonth, amount, and remark are required.",
            });
            return;
        }
        // Validate salaryMonth format YYYY-MM
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(salaryMonth)) {
            res.status(400).json({
                success: false,
                message: "salaryMonth must be in YYYY-MM format (e.g. 2025-08).",
            });
            return;
        }
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            res.status(400).json({
                success: false,
                message: "amount must be a positive number.",
            });
            return;
        }
        const data = await service.createAdvanceRequest({
            employeeId: Number(employeeId),
            salaryMonth,
            amount: amountNum,
            remark: String(remark).trim(),
        });
        res.status(201).json({
            success: true,
            message: "Advance salary request submitted successfully.",
            data,
        });
    }
    catch (error) {
        const msg = error.message;
        const status = msg.includes("already exists") ? 409 : 500;
        res.status(status).json({ success: false, message: msg });
    }
};
exports.createAdvanceRequest = createAdvanceRequest;
// ── Get All (employee-scoped, paginated) ──────────────────────────────────────
const getAdvanceRequests = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pageIndex = "0", pageSize = "10", status, } = req.query;
        if (status && !VALID_STATUSES.includes(status)) {
            res.status(400).json({
                success: false,
                message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
            });
            return;
        }
        const result = await service.getAdvanceRequests({
            employeeId: Number(employeeId),
            pageIndex,
            pageSize,
            status: status,
        });
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.getAdvanceRequests = getAdvanceRequests;
// ── Delete (only PENDING) ─────────────────────────────────────────────────────
const deleteAdvanceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await service.getAdvanceRequestById(Number(id));
        if (!existing) {
            res.status(404).json({ success: false, message: "Request not found." });
            return;
        }
        if (existing.status !== "PENDING") {
            res.status(400).json({
                success: false,
                message: "Only pending requests can be deleted.",
            });
            return;
        }
        await service.deleteAdvanceRequest(Number(id));
        res
            .status(200)
            .json({ success: true, message: "Request deleted successfully." });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.deleteAdvanceRequest = deleteAdvanceRequest;
// ── Get History (employee-scoped, paginated) ──────────────────────────────────
const getAdvanceHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pageIndex = "0", pageSize = "10" } = req.query;
        const result = await service.getAdvanceHistory({
            employeeId: Number(employeeId),
            pageIndex,
            pageSize,
        });
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
exports.getAdvanceHistory = getAdvanceHistory;
