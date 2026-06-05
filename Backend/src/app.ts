import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import taskRoutes from "./module/task/task.routes";
import circularRoutes from "./module/circular/circular.routes";
import employeeRoutes from "./module/employees/employee.routes";
import attendanceRoutes from "./module/attendance/attendance.routes";
import expenseRoutes from "./module/expense/expense.routes";
import authRoutes from "./module/auth/auth.routes";
import advanceSalaryRoutes from "./module/advance-salary/advance-salary.routes";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

// Allow requests from the Vite dev server.
// withCredentials=true on the client requires a specific origin — not "*".
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true, // required for httpOnly cookie + withCredentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
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
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/advance-salary", advanceSalaryRoutes);

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
