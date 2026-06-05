import { Router } from "express";
import * as controller from "./employee.controller";

const router = Router();

router.post("/", controller.createEmployee);
router.get("/", controller.getEmployees);

export default router;
