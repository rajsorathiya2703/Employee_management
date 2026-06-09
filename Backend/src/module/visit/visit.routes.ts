import { Router } from "express";
import * as controller from "./visit.controller";

const router = Router();

// GET    /api/visits/customers              — list active customers
router.get("/customers", controller.getCustomers);

// GET    /api/visits/stats/:employeeId      — monthly visit count
router.get("/stats/:employeeId", controller.getMonthlyCount);

// POST   /api/visits                        — create a visit
router.post("/", controller.createVisit);

// GET    /api/visits/single/:id             — get one visit
router.get("/single/:id", controller.getVisitById);

// GET    /api/visits/:employeeId            — paginated visits (my | team)
router.get("/:employeeId", controller.getVisits);

// PATCH  /api/visits/:id                    — update a visit
router.patch("/:id", controller.updateVisit);

// DELETE /api/visits/:id                    — delete a scheduled visit
router.delete("/:id", controller.deleteVisit);

export default router;
