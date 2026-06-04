const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const taskRoutes = require("./module/task/task.routes.js");
const circularRoutes = require("./module/circular/circular.routes.js");
const employeeRoutes = require("./module/employees/employee.routes.js");
const attendanceRoutes = require("./module/attendance/attendance.routes.js");

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Management API Running",
  });
});

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

app.use("/api/tasks", taskRoutes);
app.use("/api/circulars", circularRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);

/*
|--------------------------------------------------------------------------
| Not Found Route
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

module.exports = app;