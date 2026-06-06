import axiosInstance from "./axios";
import type { SalaryComponent } from "../types";

export interface CreateSalarySlipPayload {
  employeeId: number;
  salaryMonth: string;
  department?: string;
  designation?: string;
  bankName?: string;
  accountNo?: string;
  panNo?: string;
  salaryMode?: string;
  monthWorkingDays?: number;
  presentDays?: number;
  paidLeaves?: number;
  unpaidLeaves?: number;
  joiningGrossSalary?: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

export const getSalarySlips = (employeeId: number, year?: number) =>
  axiosInstance.get(`/salary-slips/${employeeId}`, { params: year ? { year: String(year) } : {} });

export const getSalarySlipById = (id: number) =>
  axiosInstance.get(`/salary-slips/single/${id}`);

export const createSalarySlip = (data: CreateSalarySlipPayload) =>
  axiosInstance.post("/salary-slips", data);
