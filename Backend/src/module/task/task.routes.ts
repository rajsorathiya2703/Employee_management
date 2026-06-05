import { Router } from "express";
import * as controller from "./task.controller";

const router = Router();

router.post("/", controller.createTask);
router.get("/", controller.getAllTasks);
router.get("/dashboard", controller.dashboardSummary);
router.get("/:id", controller.getSingleTask);
router.patch("/:id", controller.updateTask);
router.patch("/:id/complete", controller.completeTask);
router.patch("/:id/delete", controller.deleteTask);
router.patch("/:id/restore", controller.restoreTask);

export default router;
