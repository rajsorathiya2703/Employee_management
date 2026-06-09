import axiosInstance from "./axios";
import type {
  VisitCategory,
  VisitLocationMode,
  VisitPurpose,
  VisitScheduleType,
} from "../types";

export interface CreateVisitPayload {
  createdById: number;
  category: VisitCategory;
  employeeId: number;
  companionEmployeeId?: number;
  customerId: number;
  visitDate: string;
  purpose?: VisitPurpose;
  scheduleType?: VisitScheduleType;
  locationMode?: VisitLocationMode;
  remarks?: string;
}

export interface UpdateVisitPayload {
  customerId?: number;
  visitDate?: string;
  purpose?: VisitPurpose;
  scheduleType?: VisitScheduleType;
  locationMode?: VisitLocationMode;
  remarks?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export const getCustomers = () => axiosInstance.get("/visits/customers");

export const getMonthlyVisitCount = (
  employeeId: number,
  params: { month?: number; year?: number } = {}
) => axiosInstance.get(`/visits/stats/${employeeId}`, { params });

export const getVisits = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => axiosInstance.get(`/visits/${employeeId}`, { params });

export const getVisitById = (id: number) =>
  axiosInstance.get(`/visits/single/${id}`);

export const createVisit = (data: CreateVisitPayload) =>
  axiosInstance.post("/visits", data);

export const updateVisit = (id: number, data: UpdateVisitPayload) =>
  axiosInstance.patch(`/visits/${id}`, data);

export const deleteVisit = (id: number) =>
  axiosInstance.delete(`/visits/${id}`);
