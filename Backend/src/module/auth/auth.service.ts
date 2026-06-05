import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../../config/prisma";

// ── Token helpers ─────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JwtPayload {
  id: number;
  email: string;
  name: string;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;

// ── Mailer ────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendOtpEmail = async (
  to: string,
  name: string,
  otp: string
): Promise<void> => {
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

// ── OTP helper ────────────────────────────────────────────────────────────────

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Service methods ───────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export const register = async (payload: RegisterPayload) => {
  const { name, email, password, phone } = payload;

  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists.");

  const hashed = await bcrypt.hash(password, 12);

  const employee = await prisma.employee.create({
    data: { name, email, password: hashed, phone },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });

  return employee;
};

export const login = async (email: string, password: string) => {
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) throw new Error("Invalid email or password.");

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) throw new Error("Invalid email or password.");

  const payload: JwtPayload = {
    id: employee.id,
    email: employee.email,
    name: employee.name,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persist refresh token
  await prisma.employee.update({
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

export const refreshTokens = async (token: string) => {
  let decoded: JwtPayload;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new Error("Invalid or expired refresh token.");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: decoded.id },
  });

  if (!employee || employee.refreshToken !== token) {
    throw new Error("Refresh token revoked.");
  }

  const payload: JwtPayload = {
    id: employee.id,
    email: employee.email,
    name: employee.name,
  };

  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await prisma.employee.update({
    where: { id: employee.id },
    data: { refreshToken: newRefreshToken },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (employeeId: number) => {
  await prisma.employee.update({
    where: { id: employeeId },
    data: { refreshToken: null },
  });
};

export const sendPasswordResetOtp = async (email: string) => {
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) throw new Error("No account found with this email.");

  const otp = generateOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.employee.update({
    where: { id: employee.id },
    data: { otpCode: otp, otpExpiry: expiry },
  });

  await sendOtpEmail(email, employee.name, otp);
};

export const verifyOtp = async (email: string, otp: string) => {
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) throw new Error("No account found with this email.");

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
  await prisma.employee.update({
    where: { id: employee.id },
    data: { otpCode: null, otpExpiry: null },
  });

  return true;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  // Re-verify OTP before allowing reset (in case verify-otp step was skipped)
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) throw new Error("No account found with this email.");

  // OTP already cleared in verifyOtp — or still present for single-step reset
  if (employee.otpCode) {
    if (!employee.otpExpiry || new Date() > employee.otpExpiry) {
      throw new Error("OTP has expired. Please request a new one.");
    }
    if (employee.otpCode !== otp) {
      throw new Error("Invalid OTP.");
    }
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      password: hashed,
      otpCode: null,
      otpExpiry: null,
      refreshToken: null, // revoke all sessions on password reset
    },
  });
};
