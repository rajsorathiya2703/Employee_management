import { Router } from "express";
import * as controller from "./expense.controller";

const router = Router();

// POST   /api/expenses          — create a new expense
router.post("/", controller.createExpense);

// GET    /api/expenses/:employeeId  — get paginated expenses for an employee
router.get("/:employeeId", controller.getExpenses);

// GET    /api/expenses/single/:id  — get one expense by id
router.get("/single/:id", controller.getExpenseById);

// PATCH  /api/expenses/:id  — update an expense
router.patch("/:id", controller.updateExpense);

// DELETE /api/expenses/:id  — delete a pending expense
router.delete("/:id", controller.deleteExpense);

export default router;
