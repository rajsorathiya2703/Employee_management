import { Request, Response } from "express";
import * as service from "./salary-slip.service";

export const createSalarySlip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, salaryMonth, earnings, deductions, ...rest } = req.body;
    if (!employeeId || !salaryMonth || !Array.isArray(earnings) || !Array.isArray(deductions)) {
      res.status(400).json({ success: false, message: "employeeId, salaryMonth, earnings and deductions are required." });
      return;
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(salaryMonth)) {
      res.status(400).json({ success: false, message: "salaryMonth must be YYYY-MM." });
      return;
    }
    const data = await service.createSalarySlip({ employeeId: Number(employeeId), salaryMonth, earnings, deductions, ...rest });
    res.status(201).json({ success: true, message: "Salary slip saved.", data });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const getSalarySlips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query as { year?: string };
    const data = await service.getSalarySlipsByEmployee(Number(employeeId), year);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const getSalarySlipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await service.getSalarySlipById(Number(req.params.id));
    if (!data) { res.status(404).json({ success: false, message: "Not found." }); return; }
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
