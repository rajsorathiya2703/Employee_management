import { Request, Response } from "express";
import * as service from "./advance-salary.service";
import { AdvanceSalaryStatus } from "@prisma/client";

const VALID_STATUSES = Object.values(AdvanceSalaryStatus);

// ── Create ────────────────────────────────────────────────────────────────────

export const createAdvanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, salaryMonth, amount, remark } = req.body;

    if (!employeeId || !salaryMonth || !amount || !remark) {
      res.status(400).json({
        success: false,
        message: "employeeId, salaryMonth, amount, and remark are required.",
      });
      return;
    }

    // Validate salaryMonth format YYYY-MM
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(salaryMonth)) {
      res.status(400).json({
        success: false,
        message: "salaryMonth must be in YYYY-MM format (e.g. 2025-08).",
      });
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({
        success: false,
        message: "amount must be a positive number.",
      });
      return;
    }

    const data = await service.createAdvanceRequest({
      employeeId: Number(employeeId),
      salaryMonth,
      amount: amountNum,
      remark: String(remark).trim(),
    });

    res.status(201).json({
      success: true,
      message: "Advance salary request submitted successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("already exists") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Get All (employee-scoped, paginated) ──────────────────────────────────────

export const getAdvanceRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const {
      pageIndex = "0",
      pageSize = "10",
      status,
    } = req.query as {
      pageIndex?: string;
      pageSize?: string;
      status?: string;
    };

    if (status && !VALID_STATUSES.includes(status as AdvanceSalaryStatus)) {
      res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const result = await service.getAdvanceRequests({
      employeeId: Number(employeeId),
      pageIndex,
      pageSize,
      status: status as AdvanceSalaryStatus | undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Delete (only PENDING) ─────────────────────────────────────────────────────

export const deleteAdvanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await service.getAdvanceRequestById(Number(id));

    if (!existing) {
      res.status(404).json({ success: false, message: "Request not found." });
      return;
    }

    if (existing.status !== "PENDING") {
      res.status(400).json({
        success: false,
        message: "Only pending requests can be deleted.",
      });
      return;
    }

    await service.deleteAdvanceRequest(Number(id));

    res
      .status(200)
      .json({ success: true, message: "Request deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};
