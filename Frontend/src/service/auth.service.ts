import axiosInstance from "./axios";

export const forgotPassword = (email: string) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const verifyOtp = (email: string, otp: string) =>
  axiosInstance.post("/auth/verify-otp", { email, otp });

export const resetPassword = (email: string, otp: string, newPassword: string) =>
  axiosInstance.post("/auth/reset-password", { email, otp, newPassword });
