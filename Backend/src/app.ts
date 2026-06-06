import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import taskRoutes from "./module/task/task.routes";
import circularRoutes from "./module/circular/circular.routes";
import employeeRoutes from "./module/employees/employee.routes";
import attendanceRoutes from "./module/attendance/attendance.routes";
import expenseRoutes from "./module/expense/expense.routes";
import authRoutes from "./module/auth/auth.routes";
import advanceSalaryRoutes from "./module/advance-salary/advance-salary.routes";
import salarySlipRoutes from "./module/salary-slip/salary-slip.routes";

const app = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

// Allow requests from the Vite dev server and any configured production origins.
// withCredentials=true on the client requires a specific origin — not "*".
//
// CLIENT_URL can be a single URL or a comma-separated list, e.g.:
//   CLIENT_URL=https://your-app.vercel.app,https://your-app-git-main.vercel.app
const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://5173",
  "http://localhost:3000",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((u) => u.trim()).filter(Boolean)
    : []),
];

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
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


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
app.use("/api/salary-slips", salarySlipRoutes);

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
