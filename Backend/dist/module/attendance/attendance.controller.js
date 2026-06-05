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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAttendance = exports.getSessionsByAttendanceId = exports.getTodaySessions = exports.getMonthlyAttendance = exports.punchOut = exports.punchIn = void 0;
const service = __importStar(require("./attendance.service"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const punchIn = async (req, res) => {
    try {
        const result = await service.punchIn(Number(req.body.employeeId));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.punchIn = punchIn;
const punchOut = async (req, res) => {
    try {
        await service.punchOut(Number(req.body.employeeId));
        res.json({ success: true, message: "Punch out successful" });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.punchOut = punchOut;
const getMonthlyAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const month = parseInt(req.query.month || String(new Date().getMonth() + 1));
        const year = parseInt(req.query.year || String(new Date().getFullYear()));
        const result = await service.getMonthlyAttendance(Number(employeeId), month, year);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMonthlyAttendance = getMonthlyAttendance;
const getTodaySessions = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const result = await service.getTodaySessions(Number(employeeId));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTodaySessions = getTodaySessions;
const getSessionsByAttendanceId = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const result = await service.getSessionsByAttendanceId(Number(attendanceId));
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSessionsByAttendanceId = getSessionsByAttendanceId;
const getMyAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pageIndex = "0", pageSize = "10" } = req.query;
        const pageIdx = parseInt(pageIndex);
        const limit = parseInt(pageSize);
        const [data, total] = await Promise.all([
            prisma_1.default.attendance.findMany({
                where: { employeeId: Number(employeeId) },
                skip: pageIdx * limit,
                take: limit,
                orderBy: { attendanceDate: "desc" },
            }),
            prisma_1.default.attendance.count({
                where: { employeeId: Number(employeeId) },
            }),
        ]);
        res.json({
            success: true,
            data,
            pagination: { total, pageIndex: pageIdx, pageSize: limit },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyAttendance = getMyAttendance;
