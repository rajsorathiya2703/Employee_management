import { Request, Response } from "express";
export declare const createExpense: (req: Request, res: Response) => Promise<void>;
export declare const getExpenses: (req: Request, res: Response) => Promise<void>;
export declare const getExpenseById: (req: Request, res: Response) => Promise<void>;
export declare const updateExpense: (req: Request, res: Response) => Promise<void>;
export declare const deleteExpense: (req: Request, res: Response) => Promise<void>;
