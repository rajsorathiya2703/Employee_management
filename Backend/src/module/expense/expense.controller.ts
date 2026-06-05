import { Request, Response } from "express";
import * as service from "./expense.service";
import { ExpenseStatus, ExpenseType } from "@prisma/client";

const VALID_EXPENSE_TYPES = Object.values(ExpenseType);
const VALID_STATUSES = Object.values(ExpenseStatus);

// ── Create ───────────────────────────────────────────────────────────────────

export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      employeeId,
      title,
      date,
      siteName,
      amount,
      category,
      expenseType,
      unit,
      unitRate,
      multiLevelApproval,
    } = req.body;

    if (!employeeId || !title || !date || !siteName || !amount || !category) {
      res.status(400).json({
        success: false,
        message:
          "employeeId, title, date, siteName, amount, and category are required",
      });
      return;
    }

    if (expenseType && !VALID_EXPENSE_TYPES.includes(expenseType)) {
      res.status(400).json({
        success: false,
        message: `expenseType must be one of: ${VALID_EXPENSE_TYPES.join(", ")}`,
      });
      return;
    }

    const data = await service.createExpense({
      employeeId: Number(employeeId),
      title,
      date,
      siteName,
      amount: Number(amount),
      category,
      expenseType,
      unit,
      unitRate: unitRate != null ? Number(unitRate) : undefined,
      multiLevelApproval,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Get All (employee-scoped, paginated) ─────────────────────────────────────

export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const {
      pageIndex = "0",
      pageSize = "10",
      status,
      month,
      year,
    } = req.query as {
      pageIndex?: string;
      pageSize?: string;
      status?: string;
      month?: string;
      year?: string;
    };

    if (status && !VALID_STATUSES.includes(status as ExpenseStatus)) {
      res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const result = await service.getExpenses({
      employeeId: Number(employeeId),
      pageIndex,
      pageSize,
      status: status as ExpenseStatus | undefined,
      month,
      year,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Get Single ───────────────────────────────────────────────────────────────

export const getExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await service.getExpenseById(Number(id));

    if (!expense) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Update ───────────────────────────────────────────────────────────────────

export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      date,
      siteName,
      amount,
      category,
      expenseType,
      unit,
      unitRate,
      multiLevelApproval,
    } = req.body;

    if (expenseType && !VALID_EXPENSE_TYPES.includes(expenseType)) {
      res.status(400).json({
        success: false,
        message: `expenseType must be one of: ${VALID_EXPENSE_TYPES.join(", ")}`,
      });
      return;
    }

    const data = await service.updateExpense(Number(id), {
      title,
      date,
      siteName,
      amount: amount != null ? Number(amount) : undefined,
      category,
      expenseType,
      unit,
      unitRate: unitRate != null ? Number(unitRate) : undefined,
      multiLevelApproval,
    });

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Delete ───────────────────────────────────────────────────────────────────

export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verify the expense exists first
    const existing = await service.getExpenseById(Number(id));
    if (!existing) {
      res.status(404).json({ success: false, message: "Expense not found" });
      return;
    }

    // Only PENDING expenses can be deleted by the employee
    if (existing.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending expenses can be deleted",
      });
      return;
    }

    await service.deleteExpense(Number(id));

    res
      .status(200)
      .json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};
