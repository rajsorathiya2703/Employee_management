import axiosInstance from "./axios";

export interface CreateAdvancePayload {
  employeeId: number;
  salaryMonth: string; // "YYYY-MM"
  amount: number;
  remark: string;
}

export const getAdvanceRequests = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => axiosInstance.get(`/advance-salary/${employeeId}`, { params });

export const createAdvanceRequest = (data: CreateAdvancePayload) =>
  axiosInstance.post("/advance-salary", data);

export const deleteAdvanceRequest = (id: number) =>
  axiosInstance.delete(`/advance-salary/${id}`);
