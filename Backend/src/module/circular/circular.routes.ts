import { Router } from "express";
import * as controller from "./circular.controller";

const router = Router();

router.post("/", controller.createCircular);
router.get("/", controller.getAllCirculars);
router.get("/:id", controller.getCircularById);
router.patch("/:id", controller.updateCircular);
router.delete("/:id", controller.deleteCircular);

export default router;
