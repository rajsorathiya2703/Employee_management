import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

const LOCAL_API_URL = "http://localhost:5000/api";

/** Render backend — do NOT use the Render deploy hook (api.render.com/deploy/...). */
const PRODUCTION_API_URL =
  "https://employee-management-by-minehrsolution.onrender.com/api";

function normalizeApiBaseUrl(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

function resolveApiBaseUrl(): string {
  // Production (Vercel): always use Render backend — ignores misconfigured VITE_API_URL
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }

  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) {
    return normalizeApiBaseUrl(fromEnv);
  }

  return LOCAL_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number };
      config?: InternalAxiosRequestConfig & { _retry?: boolean };
    };

    const originalRequest = axiosError.config;
    const status = axiosError.response?.status;

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
        localStorage.removeItem("emp_access_token");
        localStorage.removeItem("emp_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
