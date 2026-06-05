import { Request, Response } from "express";
import * as service from "./attendance-request.service";
import { AttendanceRequestStatus, AttendanceRequestType } from "@prisma/client";

export const createAttendanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId, date, type, reason } = req.body;

    if (!employeeId || !date || !type || !reason) {
      res.status(400).json({
        success: false,
        message: "employeeId, date, type, and reason are required",
      });
      return;
    }

    if (!Object.values(AttendanceRequestType).includes(type)) {
      res.status(400).json({
        success: false,
        message: `type must be one of: ${Object.values(AttendanceRequestType).join(", ")}`,
      });
      return;
    }

    const result = await service.createAttendanceRequest({
      employeeId: Number(employeeId),
      date,
      type,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Attendance request submitted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getAttendanceRequests = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { pageIndex = "0", pageSize = "10", status } = req.query as {
      pageIndex?: string;
      pageSize?: string;
      status?: string;
    };

    const result = await service.getAttendanceRequests({
      employeeId: Number(employeeId),
      pageIndex,
      pageSize,
      status: status as AttendanceRequestStatus | undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateAttendanceRequestStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(AttendanceRequestStatus).includes(status)) {
      res.status(400).json({
        success: false,
        message: `status must be one of: ${Object.values(AttendanceRequestStatus).join(", ")}`,
      });
      return;
    }

    const result = await service.updateAttendanceRequestStatus(
      Number(id),
      status
    );

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteAttendanceRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await service.deleteAttendanceRequest(Number(id));
    res.status(200).json({
      success: true,
      message: "Attendance request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
