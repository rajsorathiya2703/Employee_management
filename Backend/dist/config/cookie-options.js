"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenCookieOptions = void 0;
const isProduction = process.env.NODE_ENV === "production";
/** Cookie settings for cross-origin frontend (Vercel) + API (Render) in production. */
exports.refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
