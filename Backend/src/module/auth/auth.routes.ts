import { Router } from "express";
import * as controller from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

// Public routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/forgot-password", controller.forgotPassword);
router.post("/verify-otp", controller.verifyOtp);
router.post("/reset-password", controller.resetPassword);

// Protected routes
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getMe);

export default router;
