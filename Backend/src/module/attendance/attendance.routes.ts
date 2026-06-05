import { Router } from "express";
import * as controller from "./attendance.controller";
import * as requestController from "./attendance-request.controller";

const router = Router();

// ── Punch In / Out ──────────────────────────────────────────────────────────
router.post("/punch-in", controller.punchIn);
router.post("/punch-out", controller.punchOut);

// ── Sessions & Records ──────────────────────────────────────────────────────
router.get("/today-sessions/:employeeId", controller.getTodaySessions);
router.get("/sessions/:attendanceId", controller.getSessionsByAttendanceId);
router.get("/monthly/:employeeId", controller.getMonthlyAttendance);
router.get("/my-attendance/:employeeId", controller.getMyAttendance);

// ── Attendance Requests ─────────────────────────────────────────────────────
router.post("/requests", requestController.createAttendanceRequest);
router.get("/requests/:employeeId", requestController.getAttendanceRequests);
router.patch("/requests/:id/status", requestController.updateAttendanceRequestStatus);
router.delete("/requests/:id", requestController.deleteAttendanceRequest);

export default router;
