import { Router } from "express";
import * as controller from "./employee.controller";
import { authenticate } from "../auth/auth.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

router.post("/", controller.createEmployee);
router.get("/", controller.getEmployees);

// Profile — GET and PATCH by employee id
router.get("/profile/:id", authenticate, controller.getProfile);
router.patch("/profile/:id", authenticate, controller.updateProfile);
router.post("/profile/:id/photo", authenticate, upload.single("photo"), controller.uploadPhoto);

export default router;
