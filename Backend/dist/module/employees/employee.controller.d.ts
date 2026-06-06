import { Request, Response } from "express";
export declare const createEmployee: (req: Request, res: Response) => Promise<void>;
export declare const getEmployees: (_req: Request, res: Response) => Promise<void>;
export declare const getProfile: (req: Request, res: Response) => Promise<void>;
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
export declare const uploadPhoto: (req: Request, res: Response) => Promise<void>;
