const router = require("express").Router();

const controller = require("./attendance.controller");

router.post("/punch-in", controller.punchIn);

router.post("/punch-out", controller.punchOut);

router.get("/my-attendance/:employeeId", controller.getMyAttendance);

module.exports = router;