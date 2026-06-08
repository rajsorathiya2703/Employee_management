import { Request, Response } from "express";
import { refreshTokenCookieOptions } from "../../config/cookie-options";
import * as service from "./auth.service";

// ── Register ──────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
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

    res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        accessToken: result.accessToken,
        employee: result.employee,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: (error as Error).message });
  }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      res.status(401).json({ success: false, message: "Refresh token required." });
      return;
    }

    const tokens = await service.refreshTokens(token);

    res.cookie("refreshToken", tokens.refreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: (error as Error).message });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.id) {
      await service.logout(req.user.id);
    }

    res.clearCookie("refreshToken", refreshTokenCookieOptions);

    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// ── Me ────────────────────────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

// ── Forgot Password ───────────────────────────────────────────────────────────

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("No account") ? 404 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("expired") || msg.includes("Invalid") ? 400 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
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
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
