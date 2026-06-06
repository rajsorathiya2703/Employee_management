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

// ── Profile ───────────────────────────────────────────────────────────────────

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }
    const profile = await employeeService.getProfileById(id);
    if (!profile) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }
    const updated = await employeeService.updateProfile(id, req.body);
    res.json({ success: true, message: "Profile updated successfully.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};

export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded." });
      return;
    }
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    const updated = await employeeService.updateProfile(id, { profilePhoto: photoUrl });
    res.json({ success: true, message: "Profile photo updated successfully.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
};
