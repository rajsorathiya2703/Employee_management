import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // sends httpOnly refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor — attach access token ─────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("emp_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ───────────────────────────────

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number };
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
    };

    const originalRequest = axiosError.config;
    const status = axiosError.response?.status;

    // If access token expired, try refresh once
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;
      try {
        const res = await axiosInstance.post("/auth/refresh-token");
        const newToken: string = res.data.data.accessToken;
        localStorage.setItem("emp_access_token", newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosInstance(originalRequest);
      } catch {
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem("emp_access_token");
        localStorage.removeItem("emp_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
