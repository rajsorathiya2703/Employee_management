import { Request, Response } from "express";
import * as service from "./visit.service";
import {
  VisitCategory,
  VisitLocationMode,
  VisitPurpose,
  VisitScheduleType,
  VisitStatus,
} from "@prisma/client";

const VALID_CATEGORIES = Object.values(VisitCategory);
const VALID_PURPOSES = Object.values(VisitPurpose);
const VALID_SCHEDULE_TYPES = Object.values(VisitScheduleType);
const VALID_LOCATION_MODES = Object.values(VisitLocationMode);
const VALID_STATUSES = Object.values(VisitStatus);

// ── Customers ────────────────────────────────────────────────────────────────

export const getCustomers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = await service.getCustomers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Monthly stats ─────────────────────────────────────────────────────────────

export const getMonthlyCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query as { month?: string; year?: string };
    const result = await service.getMonthlyVisitCount(
      Number(employeeId),
      month,
      year
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Create ───────────────────────────────────────────────────────────────────

export const createVisit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      createdById,
      category,
      employeeId,
      companionEmployeeId,
      customerId,
      visitDate,
      purpose,
      scheduleType,
      locationMode,
      remarks,
    } = req.body;

    if (!createdById || !category || !employeeId || !customerId || !visitDate) {
      res.status(400).json({
        success: false,
        message:
          "createdById, category, employeeId, customerId, and visitDate are required",
      });
      return;
    }

    if (!VALID_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
      });
      return;
    }

    if (purpose && !VALID_PURPOSES.includes(purpose)) {
      res.status(400).json({
        success: false,
        message: `purpose must be one of: ${VALID_PURPOSES.join(", ")}`,
      });
      return;
    }

    if (scheduleType && !VALID_SCHEDULE_TYPES.includes(scheduleType)) {
      res.status(400).json({
        success: false,
        message: `scheduleType must be one of: ${VALID_SCHEDULE_TYPES.join(", ")}`,
      });
      return;
    }

    if (locationMode && !VALID_LOCATION_MODES.includes(locationMode)) {
      res.status(400).json({
        success: false,
        message: `locationMode must be one of: ${VALID_LOCATION_MODES.join(", ")}`,
      });
      return;
    }

    if (category === "VISIT_WITH" && !companionEmployeeId) {
      res.status(400).json({
        success: false,
        message: "companionEmployeeId is required for VISIT_WITH category",
      });
      return;
    }

    if (category === "OTHER_EMPLOYEE" && Number(employeeId) === Number(createdById)) {
      res.status(400).json({
        success: false,
        message: "Select a different employee for OTHER_EMPLOYEE visits",
      });
      return;
    }

    const data = await service.createVisit({
      createdById: Number(createdById),
      category,
      employeeId: Number(employeeId),
      companionEmployeeId:
        companionEmployeeId != null ? Number(companionEmployeeId) : undefined,
      customerId: Number(customerId),
      visitDate,
      purpose,
      scheduleType,
      locationMode,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Visit created successfully",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Get All ──────────────────────────────────────────────────────────────────

export const getVisits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const {
      scope = "my",
      pageIndex = "0",
      pageSize = "10",
      date,
    } = req.query as {
      scope?: string;
      pageIndex?: string;
      pageSize?: string;
      date?: string;
    };

    if (scope !== "my" && scope !== "team") {
      res.status(400).json({
        success: false,
        message: "scope must be 'my' or 'team'",
      });
      return;
    }

    const result = await service.getVisits({
      employeeId: Number(employeeId),
      scope,
      pageIndex,
      pageSize,
      date,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Get Single ───────────────────────────────────────────────────────────────

export const getVisitById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const visit = await service.getVisitById(Number(id));

    if (!visit) {
      res.status(404).json({ success: false, message: "Visit not found" });
      return;
    }

    res.status(200).json({ success: true, data: visit });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Update ───────────────────────────────────────────────────────────────────

export const updateVisit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      customerId,
      visitDate,
      purpose,
      scheduleType,
      locationMode,
      remarks,
      status,
    } = req.body;

    if (purpose && !VALID_PURPOSES.includes(purpose)) {
      res.status(400).json({
        success: false,
        message: `purpose must be one of: ${VALID_PURPOSES.join(", ")}`,
      });
      return;
    }

    if (scheduleType && !VALID_SCHEDULE_TYPES.includes(scheduleType)) {
      res.status(400).json({
        success: false,
        message: `scheduleType must be one of: ${VALID_SCHEDULE_TYPES.join(", ")}`,
      });
      return;
    }

    if (locationMode && !VALID_LOCATION_MODES.includes(locationMode)) {
      res.status(400).json({
        success: false,
        message: `locationMode must be one of: ${VALID_LOCATION_MODES.join(", ")}`,
      });
      return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const data = await service.updateVisit(Number(id), {
      customerId: customerId != null ? Number(customerId) : undefined,
      visitDate,
      purpose,
      scheduleType,
      locationMode,
      remarks,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Visit updated successfully",
      data,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};

// ── Delete ───────────────────────────────────────────────────────────────────

export const deleteVisit = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await service.getVisitById(Number(id));
    if (!existing) {
      res.status(404).json({ success: false, message: "Visit not found" });
      return;
    }

    if (existing.status !== "SCHEDULED") {
      res.status(400).json({
        success: false,
        message: "Only scheduled visits can be deleted",
      });
      return;
    }

    await service.deleteVisit(Number(id));

    res
      .status(200)
      .json({ success: true, message: "Visit deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: (error as Error).message });
  }
};
