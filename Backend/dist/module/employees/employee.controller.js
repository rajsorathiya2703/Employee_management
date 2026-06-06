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
exports.uploadPhoto = exports.updateProfile = exports.getProfile = exports.getEmployees = exports.createEmployee = void 0;
const employeeService = __importStar(require("./employee.service"));
const createEmployee = async (req, res) => {
    try {
        const employee = await employeeService.createEmployee(req.body);
        res.status(201).json({ success: true, data: employee });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (_req, res) => {
    const employees = await employeeService.getEmployees();
    res.json({ success: true, data: employees });
};
exports.getEmployees = getEmployees;
// ── Profile ───────────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid employee id." });
            return;
        }
        const profile = await employeeService.getProfileById(id);
        if (!profile) {
            res.status(404).json({ success: false, message: "Employee not found." });
            return;
        }
        res.json({ success: true, data: profile });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid employee id." });
            return;
        }
        const updated = await employeeService.updateProfile(id, req.body);
        res.json({ success: true, message: "Profile updated successfully.", data: updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateProfile = updateProfile;
const uploadPhoto = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid employee id." });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded." });
            return;
        }
        const photoUrl = `/uploads/profiles/${req.file.filename}`;
        const updated = await employeeService.updateProfile(id, { profilePhoto: photoUrl });
        res.json({ success: true, message: "Profile photo updated successfully.", data: updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.uploadPhoto = uploadPhoto;
