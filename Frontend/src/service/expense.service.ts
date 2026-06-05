import axiosInstance from "./axios";

export interface CreateExpensePayload {
  employeeId: number;
  title: string;
  date: string; // ISO string
  siteName: string;
  amount: number;
  category: string;
  expenseType?: "AMOUNT_WISE" | "UNIT_WISE";
  unit?: string;
  unitRate?: number;
  multiLevelApproval?: string;
}

export interface UpdateExpensePayload {
  title?: string;
  date?: string;
  siteName?: string;
  amount?: number;
  category?: string;
  expenseType?: "AMOUNT_WISE" | "UNIT_WISE";
  unit?: string;
  unitRate?: number;
  multiLevelApproval?: string;
}

export const getExpenses = (
  employeeId: number,
  params: Record<string, unknown> = {}
) => axiosInstance.get(`/expenses/${employeeId}`, { params });

export const getExpenseById = (id: number) =>
  axiosInstance.get(`/expenses/single/${id}`);

export const createExpense = (data: CreateExpensePayload) =>
  axiosInstance.post("/expenses", data);

export const updateExpense = (id: number, data: UpdateExpensePayload) =>
  axiosInstance.patch(`/expenses/${id}`, data);

export const deleteExpense = (id: number) =>
  axiosInstance.delete(`/expenses/${id}`);
