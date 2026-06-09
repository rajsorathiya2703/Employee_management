import { Router } from "express";
import * as controller from "./loan.controller";

const router = Router();

// POST   /api/loan                    — submit a new request
router.post("/", controller.createLoanRequest);

// GET    /api/loan/:employeeId       — paginated list for an employee
router.get("/:employeeId", controller.getLoanRequests);

// GET    /api/loan/:id/detail        — get a specific loan request
router.get("/:id/detail", controller.getLoanRequestById);

// PATCH  /api/loan/:id/approve       — approve a loan request
router.patch("/:id/approve", controller.approveLoanRequest);

// PATCH  /api/loan/:id/reject        — reject a loan request
router.patch("/:id/reject", controller.rejectLoanRequest);

// PATCH  /api/loan/:id/disburse      — disburse an approved loan
router.patch("/:id/disburse", controller.disburseLoanRequest);

// PATCH  /api/loan/:id/repaid        — mark loan as repaid
router.patch("/:id/repaid", controller.markLoanAsRepaid);

// DELETE /api/loan/:id               — delete a pending request
router.delete("/:id", controller.deleteLoanRequest);

export default router;
