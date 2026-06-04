const router = require("express").Router();

const controller = require("./employee.controller");

router.post("/", controller.createEmployee);

router.get("/", controller.getEmployees);

module.exports = router;