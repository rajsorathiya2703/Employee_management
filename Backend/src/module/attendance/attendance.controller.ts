import { Request, Response } from "express";
import * as service from "./attendance.service";
import prisma from "../../config/prisma";

export const punchIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await service.punchIn(Number(req.body.employeeId));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const punchOut = async (req: Request, res: Response): Promise<void> => {
  try {
    await service.punchOut(Number(req.body.employeeId));
    res.json({ success: true, message: "Punch out successful" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getMyAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { pageIndex = "0", pageSize = "10" } = req.query as {
      pageIndex?: string;
      pageSize?: string;
    };

    const pageIdx = parseInt(pageIndex);
    const limit = parseInt(pageSize);

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({
        where: { employeeId: Number(employeeId) },
        skip: pageIdx * limit,
        take: limit,
        orderBy: { attendanceDate: "desc" },
      }),
      prisma.attendance.count({
        where: { employeeId: Number(employeeId) },
      }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { total, pageIndex: pageIdx, pageSize: limit },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
