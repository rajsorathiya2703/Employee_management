import { Request, Response } from "express";
export declare const createTask: (req: Request, res: Response) => Promise<void>;
export declare const getAllTasks: (req: Request, res: Response) => Promise<void>;
export declare const getSingleTask: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<void>;
export declare const completeTask: (req: Request, res: Response) => Promise<void>;
export declare const deleteTask: (req: Request, res: Response) => Promise<void>;
export declare const restoreTask: (req: Request, res: Response) => Promise<void>;
export declare const dashboardSummary: (_req: Request, res: Response) => Promise<void>;
