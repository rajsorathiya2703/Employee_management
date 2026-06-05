import { Router } from "express";
import * as controller from "./attendance.controller";

const router = Router();

router.post("/punch-in", controller.punchIn);
router.post("/punch-out", controller.punchOut);
router.get("/today-sessions/:employeeId", controller.getTodaySessions);
router.get("/sessions/:attendanceId", controller.getSessionsByAttendanceId);
router.get("/my-attendance/:employeeId", controller.getMyAttendance);

export default router;
