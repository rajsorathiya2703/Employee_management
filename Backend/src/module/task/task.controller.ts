import { Request, Response } from "express";
import * as taskService from "./task.service";

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.createTask(req.body);
  res.status(201).json({ success: true, message: "Task created successfully", data: result });
};

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.getAllTasks(req.query);
  res.status(200).json({ success: true, data: result });
};

export const getSingleTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.getSingleTask(req.params.id as string);
  res.status(200).json({ success: true, data: result });
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.updateTask(req.params.id as string, req.body);
  res.status(200).json({ success: true, message: "Task updated successfully", data: result });
};

export const completeTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.completeTask(req.params.id as string);
  res.status(200).json({ success: true, message: "Task completed", data: result });
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.deleteTask(req.params.id as string);
  res.status(200).json({ success: true, message: "Task deleted", data: result });
};

export const restoreTask = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.restoreTask(req.params.id as string);
  res.status(200).json({ success: true, message: "Task restored", data: result });
};

export const dashboardSummary = async (_req: Request, res: Response): Promise<void> => {
  const result = await taskService.dashboardSummary();
  res.status(200).json({ success: true, data: result });
};
