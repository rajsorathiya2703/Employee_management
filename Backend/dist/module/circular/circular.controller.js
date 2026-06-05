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
exports.deleteCircular = exports.updateCircular = exports.getCircularById = exports.getAllCirculars = exports.createCircular = void 0;
const circularService = __importStar(require("./circular.service"));
const createCircular = async (req, res) => {
    try {
        const result = await circularService.createCircular(req.body);
        res.status(201).json({ success: true, message: "Circular created successfully", data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createCircular = createCircular;
const getAllCirculars = async (req, res) => {
    try {
        const result = await circularService.getAllCirculars(req.query);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllCirculars = getAllCirculars;
const getCircularById = async (req, res) => {
    try {
        const result = await circularService.getCircularById(req.params.id);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getCircularById = getCircularById;
const updateCircular = async (req, res) => {
    try {
        const result = await circularService.updateCircular(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Circular updated successfully", data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateCircular = updateCircular;
const deleteCircular = async (req, res) => {
    try {
        await circularService.deleteCircular(req.params.id);
        res.status(200).json({ success: true, message: "Circular deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteCircular = deleteCircular;
