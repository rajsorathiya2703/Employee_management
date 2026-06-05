import { Request, Response } from "express";
import * as circularService from "./circular.service";

export const createCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await circularService.createCircular(req.body);
    res.status(201).json({ success: true, message: "Circular created successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getAllCirculars = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await circularService.getAllCirculars(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getCircularById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await circularService.getCircularById(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await circularService.updateCircular(req.params.id as string, req.body);
    res.status(200).json({ success: true, message: "Circular updated successfully", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    await circularService.deleteCircular(req.params.id as string);
    res.status(200).json({ success: true, message: "Circular deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
