import { Router } from "express";
import * as ctrl from "./salary-slip.controller";

const router = Router();

router.post("/", ctrl.createSalarySlip);
router.get("/single/:id", ctrl.getSalarySlipById);
router.get("/:employeeId", ctrl.getSalarySlips);

export default router;
