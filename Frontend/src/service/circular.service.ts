import axiosInstance from "./axios";

export const getCirculars = (params: Record<string, unknown> = {}) =>
  axiosInstance.get("/circulars", { params });

export const getCircularById = (id: string) =>
  axiosInstance.get(`/circulars/${id}`);
