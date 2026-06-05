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
const task_routes_1 = __importDefault(require("./module/task/task.routes"));
const circular_routes_1 = __importDefault(require("./module/circular/circular.routes"));
const employee_routes_1 = __importDefault(require("./module/employees/employee.routes"));
const attendance_routes_1 = __importDefault(require("./module/attendance/attendance.routes"));
const expense_routes_1 = __importDefault(require("./module/expense/expense.routes"));
const auth_routes_1 = __importDefault(require("./module/auth/auth.routes"));
const advance_salary_routes_1 = __importDefault(require("./module/advance-salary/advance-salary.routes"));
const app = (0, express_1.default)();
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
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (Postman, curl, server-side)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true, // required for httpOnly cookie + withCredentials
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
