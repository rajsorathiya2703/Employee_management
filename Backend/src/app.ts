import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import taskRoutes from "./module/task/task.routes";
import circularRoutes from "./module/circular/circular.routes";
import employeeRoutes from "./module/employees/employee.routes";
import attendanceRoutes from "./module/attendance/attendance.routes";

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

app.get("/", (_req: Request, res: Response) => {
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

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

export default app;
