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
exports.deleteAttendanceRequest = exports.updateAttendanceRequestStatus = exports.getAttendanceRequests = exports.createAttendanceRequest = void 0;
const service = __importStar(require("./attendance-request.service"));
const client_1 = require("@prisma/client");
const createAttendanceRequest = async (req, res) => {
    try {
        const { employeeId, date, type, reason } = req.body;
        if (!employeeId || !date || !type || !reason) {
            res.status(400).json({
                success: false,
                message: "employeeId, date, type, and reason are required",
            });
            return;
        }
        if (!Object.values(client_1.AttendanceRequestType).includes(type)) {
            res.status(400).json({
                success: false,
                message: `type must be one of: ${Object.values(client_1.AttendanceRequestType).join(", ")}`,
            });
            return;
        }
        const result = await service.createAttendanceRequest({
            employeeId: Number(employeeId),
            date,
            type,
            reason,
        });
        res.status(201).json({
            success: true,
            message: "Attendance request submitted successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createAttendanceRequest = createAttendanceRequest;
const getAttendanceRequests = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { pageIndex = "0", pageSize = "10", status } = req.query;
        const result = await service.getAttendanceRequests({
            employeeId: Number(employeeId),
            pageIndex,
            pageSize,
            status: status,
        });
        res.status(200).json({ success: true, ...result });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAttendanceRequests = getAttendanceRequests;
const updateAttendanceRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!Object.values(client_1.AttendanceRequestStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: `status must be one of: ${Object.values(client_1.AttendanceRequestStatus).join(", ")}`,
            });
            return;
        }
        const result = await service.updateAttendanceRequestStatus(Number(id), status);
        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateAttendanceRequestStatus = updateAttendanceRequestStatus;
const deleteAttendanceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await service.deleteAttendanceRequest(Number(id));
        res.status(200).json({
            success: true,
            message: "Attendance request deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.deleteAttendanceRequest = deleteAttendanceRequest;
