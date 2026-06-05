"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOtp = exports.sendPasswordResetOtp = exports.logout = exports.refreshTokens = exports.login = exports.register = exports.sendOtpEmail = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = __importDefault(require("../../config/prisma"));
// ── Token helpers ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const signAccessToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => jsonwebtoken_1.default.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, JWT_SECRET);
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
exports.verifyRefreshToken = verifyRefreshToken;
// ── Mailer ────────────────────────────────────────────────────────────────────
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
const sendOtpEmail = async (to, name, otp) => {
    await transporter.sendMail({
        from: process.env.MAIL_FROM || "MineHR Solutions <noreply@minehr.com>",
        to,
        subject: "Your Password Reset OTP — MineHR Solutions",
        html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#1e293b;margin-bottom:4px;">Password Reset OTP</h2>
        <p style="color:#64748b;margin-top:0;">Hi ${name}, use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="background:#1a2236;color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;border-radius:10px;margin:24px 0;">
          ${otp}
        </div>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;text-align:center;">MineHR Solutions Pvt. Ltd.</p>
      </div>
    `,
    });
};
exports.sendOtpEmail = sendOtpEmail;
// ── OTP helper ────────────────────────────────────────────────────────────────
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const register = async (payload) => {
    const { name, email, password, phone } = payload;
    const existing = await prisma_1.default.employee.findUnique({ where: { email } });
    if (existing)
        throw new Error("An account with this email already exists.");
    const hashed = await bcryptjs_1.default.hash(password, 12);
    const employee = await prisma_1.default.employee.create({
        data: { name, email, password: hashed, phone },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
    });
    return employee;
};
exports.register = register;
const login = async (email, password) => {
    const employee = await prisma_1.default.employee.findUnique({ where: { email } });
    if (!employee)
        throw new Error("Invalid email or password.");
    const isMatch = await bcryptjs_1.default.compare(password, employee.password);
    if (!isMatch)
        throw new Error("Invalid email or password.");
    const payload = {
        id: employee.id,
        email: employee.email,
        name: employee.name,
    };
    const accessToken = (0, exports.signAccessToken)(payload);
    const refreshToken = (0, exports.signRefreshToken)(payload);
    // Persist refresh token
    await prisma_1.default.employee.update({
        where: { id: employee.id },
        data: { refreshToken },
    });
    return {
        accessToken,
        refreshToken,
        employee: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
        },
    };
};
exports.login = login;
const refreshTokens = async (token) => {
    let decoded;
    try {
        decoded = (0, exports.verifyRefreshToken)(token);
    }
    catch {
        throw new Error("Invalid or expired refresh token.");
    }
    const employee = await prisma_1.default.employee.findUnique({
        where: { id: decoded.id },
    });
    if (!employee || employee.refreshToken !== token) {
        throw new Error("Refresh token revoked.");
    }
    const payload = {
        id: employee.id,
        email: employee.email,
        name: employee.name,
    };
    const newAccessToken = (0, exports.signAccessToken)(payload);
    const newRefreshToken = (0, exports.signRefreshToken)(payload);
    await prisma_1.default.employee.update({
        where: { id: employee.id },
        data: { refreshToken: newRefreshToken },
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
exports.refreshTokens = refreshTokens;
const logout = async (employeeId) => {
    await prisma_1.default.employee.update({
        where: { id: employeeId },
        data: { refreshToken: null },
    });
};
exports.logout = logout;
const sendPasswordResetOtp = async (email) => {
    const employee = await prisma_1.default.employee.findUnique({ where: { email } });
    if (!employee)
        throw new Error("No account found with this email.");
    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await prisma_1.default.employee.update({
        where: { id: employee.id },
        data: { otpCode: otp, otpExpiry: expiry },
    });
    await (0, exports.sendOtpEmail)(email, employee.name, otp);
};
exports.sendPasswordResetOtp = sendPasswordResetOtp;
const verifyOtp = async (email, otp) => {
    const employee = await prisma_1.default.employee.findUnique({ where: { email } });
    if (!employee)
        throw new Error("No account found with this email.");
    if (!employee.otpCode || !employee.otpExpiry) {
        throw new Error("No OTP was requested. Please request a new one.");
    }
    if (new Date() > employee.otpExpiry) {
        throw new Error("OTP has expired. Please request a new one.");
    }
    if (employee.otpCode !== otp) {
        throw new Error("Invalid OTP. Please try again.");
    }
    // Clear OTP after successful verification
    await prisma_1.default.employee.update({
        where: { id: employee.id },
        data: { otpCode: null, otpExpiry: null },
    });
    return true;
};
exports.verifyOtp = verifyOtp;
const resetPassword = async (email, otp, newPassword) => {
    // Re-verify OTP before allowing reset (in case verify-otp step was skipped)
    const employee = await prisma_1.default.employee.findUnique({ where: { email } });
    if (!employee)
        throw new Error("No account found with this email.");
    // OTP already cleared in verifyOtp — or still present for single-step reset
    if (employee.otpCode) {
        if (!employee.otpExpiry || new Date() > employee.otpExpiry) {
            throw new Error("OTP has expired. Please request a new one.");
        }
        if (employee.otpCode !== otp) {
            throw new Error("Invalid OTP.");
        }
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.default.employee.update({
        where: { id: employee.id },
        data: {
            password: hashed,
            otpCode: null,
            otpExpiry: null,
            refreshToken: null, // revoke all sessions on password reset
        },
    });
};
exports.resetPassword = resetPassword;
