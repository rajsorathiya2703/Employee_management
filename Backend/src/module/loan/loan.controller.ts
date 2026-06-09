import { Request, Response } from "express";
import * as service from "./loan.service";

const VALID_STATUSES = ["PENDING", "APPROVED", "REJECTED", "DISBURSED", "REPAID"];

// ── Create ────────────────────────────────────────────────────────────────────

export const createLoanRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, loanAmount, reason, repaymentPeriod } = req.body;

    if (!employeeId || !loanAmount || !reason || !repaymentPeriod) {
      res.status(400).json({
        success: false,
        message:
          "employeeId, loanAmount, reason, and repaymentPeriod are required.",
      });
      return;
    }

    const amountNum = Number(loanAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({
        success: false,
        message: "loanAmount must be a positive number.",
      });
      return;
    }

    const periodNum = Number(repaymentPeriod);
    if (isNaN(periodNum) || periodNum <= 0) {
      res.status(400).json({
        success: false,
        message: "repaymentPeriod must be a positive number (in months).",
      });
      return;
    }

    const data = await service.createLoanRequest({
      employeeId: Number(employeeId),
      loanAmount: amountNum,
      reason: String(reason).trim(),
      repaymentPeriod: periodNum,
    });

    res.status(201).json({
      success: true,
      message: "Loan request submitted successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("already has") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Get All (employee-scoped, paginated) ──────────────────────────────────────

export const getLoanRequests = async (
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

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const data = await service.getLoanRequests({
      employeeId: Number(employeeId),
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
      status: status as any,
    });

    res.status(200).json({
      success: true,
      message: "Loan requests retrieved successfully.",
      ...data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    res.status(500).json({ success: false, message: msg });
  }
};

// ── Get By ID ─────────────────────────────────────────────────────────────────

export const getLoanRequestById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await service.getLoanRequestById(Number(id));

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Loan request not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Loan request retrieved successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    res.status(500).json({ success: false, message: msg });
  }
};

// ── Approve ───────────────────────────────────────────────────────────────────

export const approveLoanRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvedAmount } = req.body;

    if (!approvedAmount) {
      res.status(400).json({
        success: false,
        message: "approvedAmount is required.",
      });
      return;
    }

    const amountNum = Number(approvedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      res.status(400).json({
        success: false,
        message: "approvedAmount must be a positive number.",
      });
      return;
    }

    const data = await service.approveLoanRequest({
      id: Number(id),
      approvedAmount: amountNum,
    });

    res.status(200).json({
      success: true,
      message: "Loan request approved successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Cannot approve") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Reject ────────────────────────────────────────────────────────────────────

export const rejectLoanRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      res.status(400).json({
        success: false,
        message: "rejectionReason is required.",
      });
      return;
    }

    const data = await service.rejectLoanRequest({
      id: Number(id),
      rejectionReason: String(rejectionReason).trim(),
    });

    res.status(200).json({
      success: true,
      message: "Loan request rejected successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Cannot reject") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Disburse ──────────────────────────────────────────────────────────────────

export const disburseLoanRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await service.disburseLoanRequest(Number(id));

    res.status(200).json({
      success: true,
      message: "Loan disbursed successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Cannot disburse") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Mark as Repaid ───────────────────────────────────────────────────────────

export const markLoanAsRepaid = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await service.markLoanAsRepaid(Number(id));

    res.status(200).json({
      success: true,
      message: "Loan marked as repaid successfully.",
      data,
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Cannot mark") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteLoanRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteLoanRequest(Number(id));

    res.status(200).json({
      success: true,
      message: "Loan request deleted successfully.",
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Cannot delete") ? 409 : 500;
    res.status(status).json({ success: false, message: msg });
  }
};
