import { Request, Response } from "express";
import * as employeeService from "./employee.service";

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getEmployees = async (_req: Request, res: Response): Promise<void> => {
  const employees = await employeeService.getEmployees();
  res.json({ success: true, data: employees });
};
