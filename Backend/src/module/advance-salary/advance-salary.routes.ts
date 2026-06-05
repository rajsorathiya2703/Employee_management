import { Router } from "express";
import * as controller from "./advance-salary.controller";

const router = Router();

// POST   /api/advance-salary          — submit a new request
router.post("/", controller.createAdvanceRequest);

// GET    /api/advance-salary/:employeeId — paginated list for an employee
router.get("/:employeeId", controller.getAdvanceRequests);

// DELETE /api/advance-salary/:id      — delete a pending request
router.delete("/:id", controller.deleteAdvanceRequest);

export default router;
