import { Request, Response } from "express";
export declare const createAttendanceRequest: (req: Request, res: Response) => Promise<void>;
export declare const getAttendanceRequests: (req: Request, res: Response) => Promise<void>;
export declare const updateAttendanceRequestStatus: (req: Request, res: Response) => Promise<void>;
export declare const deleteAttendanceRequest: (req: Request, res: Response) => Promise<void>;
