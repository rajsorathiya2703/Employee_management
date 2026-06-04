const express = require("express");
const controller = require("./circular.controller");

const router = express.Router();

router.post("/", controller.createCircular);

router.get("/", controller.getAllCirculars);

router.get("/:id", controller.getCircularById);

router.patch("/:id", controller.updateCircular);

router.delete("/:id", controller.deleteCircular);

module.exports = router;