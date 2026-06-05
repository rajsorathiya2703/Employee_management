import { Request, Response } from "express";
export declare const punchIn: (req: Request, res: Response) => Promise<void>;
export declare const punchOut: (req: Request, res: Response) => Promise<void>;
export declare const getMonthlyAttendance: (req: Request, res: Response) => Promise<void>;
export declare const getTodaySessions: (req: Request, res: Response) => Promise<void>;
export declare const getSessionsByAttendanceId: (req: Request, res: Response) => Promise<void>;
export declare const getMyAttendance: (req: Request, res: Response) => Promise<void>;
