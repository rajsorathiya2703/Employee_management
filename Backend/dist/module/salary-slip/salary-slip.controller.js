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
exports.getSalarySlipById = exports.getSalarySlips = exports.createSalarySlip = void 0;
const service = __importStar(require("./salary-slip.service"));
const createSalarySlip = async (req, res) => {
    try {
        const { employeeId, salaryMonth, earnings, deductions, ...rest } = req.body;
        if (!employeeId || !salaryMonth || !Array.isArray(earnings) || !Array.isArray(deductions)) {
            res.status(400).json({ success: false, message: "employeeId, salaryMonth, earnings and deductions are required." });
            return;
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(salaryMonth)) {
            res.status(400).json({ success: false, message: "salaryMonth must be YYYY-MM." });
            return;
        }
        const data = await service.createSalarySlip({ employeeId: Number(employeeId), salaryMonth, earnings, deductions, ...rest });
        res.status(201).json({ success: true, message: "Salary slip saved.", data });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createSalarySlip = createSalarySlip;
const getSalarySlips = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { year } = req.query;
        const data = await service.getSalarySlipsByEmployee(Number(employeeId), year);
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSalarySlips = getSalarySlips;
const getSalarySlipById = async (req, res) => {
    try {
        const data = await service.getSalarySlipById(Number(req.params.id));
        if (!data) {
            res.status(404).json({ success: false, message: "Not found." });
            return;
        }
        res.status(200).json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSalarySlipById = getSalarySlipById;
