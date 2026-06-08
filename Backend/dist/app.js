"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const task_routes_1 = __importDefault(require("./module/task/task.routes"));
const circular_routes_1 = __importDefault(require("./module/circular/circular.routes"));
const employee_routes_1 = __importDefault(require("./module/employees/employee.routes"));
const attendance_routes_1 = __importDefault(require("./module/attendance/attendance.routes"));
const expense_routes_1 = __importDefault(require("./module/expense/expense.routes"));
const auth_routes_1 = __importDefault(require("./module/auth/auth.routes"));
const advance_salary_routes_1 = __importDefault(require("./module/advance-salary/advance-salary.routes"));
const salary_slip_routes_1 = __importDefault(require("./module/salary-slip/salary-slip.routes"));
const app = (0, express_1.default)();
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
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    ...(process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",").map((u) => u.trim()).filter(Boolean)
        : []),
];
const isOriginAllowed = (origin) => {
    if (allowedOrigins.includes(origin))
        return true;
    // Production: allow Vercel production + preview deployments
    if (process.env.NODE_ENV === "production" &&
        /^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
        return true;
    }
    return false;
};
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, mobile apps)
        if (!origin)
            return callback(null, true);
        if (isOriginAllowed(origin))
            return callback(null, true);
        callback(null, false);
    },
    credentials: true, // required for httpOnly cookie + withCredentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from the uploads directory
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/
app.get("/", (_req, res) => {
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
app.use("/api/tasks", task_routes_1.default);
app.use("/api/circulars", circular_routes_1.default);
app.use("/api/employees", employee_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/expenses", expense_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.use("/api/advance-salary", advance_salary_routes_1.default);
app.use("/api/salary-slips", salary_slip_routes_1.default);
/*
|--------------------------------------------------------------------------
| Not Found Route
|--------------------------------------------------------------------------
*/
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});
exports.default = app;
