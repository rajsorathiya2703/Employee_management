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
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.getMe = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const cookie_options_1 = require("../../config/cookie-options");
const service = __importStar(require("./auth.service"));
// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "name, email, and password are required.",
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
            return;
        }
        const employee = await service.register({ name, email, password, phone });
        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: employee,
        });
    }
    catch (error) {
        const msg = error.message;
        const status = msg.includes("already exists") ? 409 : 500;
        res.status(status).json({ success: false, message: msg });
    }
};
exports.register = register;
// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "email and password are required.",
            });
            return;
        }
        const result = await service.login(email, password);
        res.cookie("refreshToken", result.refreshToken, cookie_options_1.refreshTokenCookieOptions);
        res.status(200).json({
            success: true,
            message: "Logged in successfully.",
            data: {
                accessToken: result.accessToken,
                employee: result.employee,
            },
        });
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};
exports.login = login;
// ── Refresh Token ─────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            res.status(401).json({ success: false, message: "Refresh token required." });
            return;
        }
        const tokens = await service.refreshTokens(token);
        res.cookie("refreshToken", tokens.refreshToken, cookie_options_1.refreshTokenCookieOptions);
        res.status(200).json({
            success: true,
            data: { accessToken: tokens.accessToken },
        });
    }
    catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};
exports.refreshToken = refreshToken;
// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        if (req.user?.id) {
            await service.logout(req.user.id);
        }
        res.clearCookie("refreshToken", cookie_options_1.refreshTokenCookieOptions);
        res.status(200).json({ success: true, message: "Logged out successfully." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.logout = logout;
// ── Me ────────────────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    });
};
exports.getMe = getMe;
// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "email is required." });
            return;
        }
        await service.sendPasswordResetOtp(email);
        res.status(200).json({
            success: true,
            message: "OTP sent to your email address.",
        });
    }
    catch (error) {
        const msg = error.message;
        const status = msg.includes("No account") ? 404 : 500;
        res.status(status).json({ success: false, message: msg });
    }
};
exports.forgotPassword = forgotPassword;
// ── Verify OTP ────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ success: false, message: "email and otp are required." });
            return;
        }
        await service.verifyOtp(email, otp);
        res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
        });
    }
    catch (error) {
        const msg = error.message;
        const status = msg.includes("expired") || msg.includes("Invalid") ? 400 : 500;
        res.status(status).json({ success: false, message: msg });
    }
};
exports.verifyOtp = verifyOtp;
// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            res.status(400).json({
                success: false,
                message: "email, otp, and newPassword are required.",
            });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
            return;
        }
        await service.resetPassword(email, otp, newPassword);
        res.status(200).json({
            success: true,
            message: "Password reset successfully. Please log in.",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.resetPassword = resetPassword;
