import axiosInstance from "./axios";

export const getTasks = (params: Record<string, unknown> = {}) =>
  axiosInstance.get("/tasks", { params });

export const getDashboard = () => axiosInstance.get("/tasks/dashboard");

export const createTask = (data: Record<string, unknown>) =>
  axiosInstance.post("/tasks", data);

export const updateTask = (id: string, data: Record<string, unknown>) =>
  axiosInstance.patch(`/tasks/${id}`, data);

export const completeTask = (id: string) =>
  axiosInstance.patch(`/tasks/${id}/complete`);

export const deleteTask = (id: string) =>
  axiosInstance.patch(`/tasks/${id}/delete`);

export const restoreTask = (id: string) =>
  axiosInstance.patch(`/tasks/${id}/restore`);
