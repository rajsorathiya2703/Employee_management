import { Request, Response } from "express";
export declare const createCircular: (req: Request, res: Response) => Promise<void>;
export declare const getAllCirculars: (req: Request, res: Response) => Promise<void>;
export declare const getCircularById: (req: Request, res: Response) => Promise<void>;
export declare const updateCircular: (req: Request, res: Response) => Promise<void>;
export declare const deleteCircular: (req: Request, res: Response) => Promise<void>;
