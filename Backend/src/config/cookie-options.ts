import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

/** Cookie settings for cross-origin frontend (Vercel) + API (Render) in production. */
export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
