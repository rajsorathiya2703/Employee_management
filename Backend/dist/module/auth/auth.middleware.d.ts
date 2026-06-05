import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "./auth.service";
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
