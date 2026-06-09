import axiosInstance from "./axios";

export interface CreateLoanPayload {
  employeeId: number;
  loanAmount: number;
  reason: string;
  repaymentPeriod: number;
}

export interface ApproveLoanPayload {
  approvedAmount: number;
}

export interface RejectLoanPayload {
  rejectionReason: string;
}

export const getLoanRequests = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => axiosInstance.get(`/loan/${employeeId}`, { params });

export const getLoanRequestById = (id: number) =>
  axiosInstance.get(`/loan/${id}/detail`);

export const createLoanRequest = (data: CreateLoanPayload) =>
  axiosInstance.post("/loan", data);

export const approveLoanRequest = (id: number, data: ApproveLoanPayload) =>
  axiosInstance.patch(`/loan/${id}/approve`, data);

export const rejectLoanRequest = (id: number, data: RejectLoanPayload) =>
  axiosInstance.patch(`/loan/${id}/reject`, data);

export const disburseLoanRequest = (id: number) =>
  axiosInstance.patch(`/loan/${id}/disburse`);

export const markLoanAsRepaid = (id: number) =>
  axiosInstance.patch(`/loan/${id}/repaid`);

export const deleteLoanRequest = (id: number) =>
  axiosInstance.delete(`/loan/${id}`);
