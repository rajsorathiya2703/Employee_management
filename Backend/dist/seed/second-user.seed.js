"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
async function main() {
    console.log("Seeding second user...");
    // ── Create second employee ────────────────────────────────────────────────
    const hashedPassword = await bcryptjs_1.default.hash("Priya@123", 12);
    const employee = await prisma_1.default.employee.upsert({
        where: { email: "priya@gmail.com" },
        update: {
            password: hashedPassword,
            name: "Priya Sharma",
            phone: "9876500001",
        },
        create: {
            name: "Priya Sharma",
            email: "priya@gmail.com",
            password: hashedPassword,
            phone: "9876500001",
        },
    });
    console.log(`  ✓ Employee created — ID: ${employee.id} | ${employee.email}`);
    // ── Attendance (June 2026) ────────────────────────────────────────────────
    const attendanceDays = [
        { date: "2026-06-01", punchIn: "09:30", punchOut: "18:30", minutes: 540 },
        { date: "2026-06-02", punchIn: "09:45", punchOut: "18:15", minutes: 510 },
        { date: "2026-06-03", punchIn: "09:00", punchOut: "17:30", minutes: 510 },
        { date: "2026-06-04", punchIn: "10:00", punchOut: "18:00", minutes: 480 },
        { date: "2026-06-05", punchIn: "09:20", punchOut: "18:20", minutes: 540 },
        { date: "2026-06-07", punchIn: "09:10", punchOut: "18:10", minutes: 540 },
        { date: "2026-06-08", punchIn: "09:05", punchOut: "18:05", minutes: 540 },
    ];
    for (const day of attendanceDays) {
        // Skip if already seeded (idempotent)
        const existing = await prisma_1.default.attendance.findUnique({
            where: {
                employeeId_attendanceDate: {
                    employeeId: employee.id,
                    attendanceDate: new Date(day.date),
                },
            },
        });
        if (existing)
            continue;
        const attendance = await prisma_1.default.attendance.create({
            data: {
                employeeId: employee.id,
                attendanceDate: new Date(day.date),
                firstPunchIn: new Date(`${day.date}T${day.punchIn}:00`),
                lastPunchOut: new Date(`${day.date}T${day.punchOut}:00`),
                totalMinutes: day.minutes,
                status: "PRESENT",
            },
        });
        // Morning session
        await prisma_1.default.attendanceSession.create({
            data: {
                attendanceId: attendance.id,
                punchIn: new Date(`${day.date}T${day.punchIn}:00`),
                punchOut: new Date(`${day.date}T13:00:00`),
                durationMinute: 210,
            },
        });
        // Afternoon session
        await prisma_1.default.attendanceSession.create({
            data: {
                attendanceId: attendance.id,
                punchIn: new Date(`${day.date}T14:00:00`),
                punchOut: new Date(`${day.date}T${day.punchOut}:00`),
                durationMinute: 270,
            },
        });
    }
    console.log(`  ✓ Attendance seeded (${attendanceDays.length} days)`);
    // ── Attendance Requests ───────────────────────────────────────────────────
    const existingRequests = await prisma_1.default.attendanceRequest.count({
        where: { employeeId: employee.id },
    });
    if (existingRequests === 0) {
        await prisma_1.default.attendanceRequest.createMany({
            data: [
                {
                    employeeId: employee.id,
                    date: new Date("2026-06-06"),
                    type: "WORK_FROM_HOME",
                    reason: "Child's school function; worked remotely with manager approval",
                    status: "APPROVED",
                },
                {
                    employeeId: employee.id,
                    date: new Date("2026-05-30"),
                    type: "PUNCH_IN_ADJUSTMENT",
                    reason: "Biometric reader offline in morning; verified by security log",
                    status: "PENDING",
                },
                {
                    employeeId: employee.id,
                    date: new Date("2026-05-26"),
                    type: "HALF_DAY_PRESENT",
                    reason: "Doctor appointment in the morning; joined after lunch",
                    status: "APPROVED",
                },
                {
                    employeeId: employee.id,
                    date: new Date("2026-05-20"),
                    type: "FULL_DAY_PRESENT",
                    reason: "Off-site client demo; attendance device unavailable",
                    status: "DECLINED",
                },
                {
                    employeeId: employee.id,
                    date: new Date("2026-05-15"),
                    type: "PUNCH_OUT_ADJUSTMENT",
                    reason: "Left early for an emergency; forgot to punch out",
                    status: "PENDING",
                },
            ],
        });
        console.log("  ✓ Attendance requests seeded (5 records)");
    }
    // ── Expenses ──────────────────────────────────────────────────────────────
    const existingExpenses = await prisma_1.default.expense.count({
        where: { employeeId: employee.id },
    });
    if (existingExpenses === 0) {
        await prisma_1.default.expense.createMany({
            data: [
                // June 2026
                {
                    expenseCode: "EXP5001",
                    employeeId: employee.id,
                    title: "Client meeting - cab fare",
                    date: new Date("2026-06-03"),
                    siteName: "Pune",
                    amount: new client_1.Prisma.Decimal(650.0),
                    category: "Travel - Bus",
                    expenseType: "AMOUNT_WISE",
                    status: "PENDING",
                },
                {
                    expenseCode: "EXP5002",
                    employeeId: employee.id,
                    title: "Team breakfast - sprint kickoff",
                    date: new Date("2026-06-05"),
                    siteName: "Mumbai",
                    amount: new client_1.Prisma.Decimal(1800.0),
                    category: "Food & Meals",
                    expenseType: "AMOUNT_WISE",
                    status: "PENDING",
                },
                {
                    expenseCode: "EXP5003",
                    employeeId: employee.id,
                    title: "Internet recharge - WFH month",
                    date: new Date("2026-06-06"),
                    siteName: "Nashik",
                    amount: new client_1.Prisma.Decimal(499.0),
                    category: "Telephone & Internet",
                    expenseType: "AMOUNT_WISE",
                    status: "UNPAID",
                },
                // May 2026
                {
                    expenseCode: "EXP5004",
                    employeeId: employee.id,
                    title: "Flight - product demo at HQ",
                    date: new Date("2026-05-14"),
                    siteName: "Bangalore",
                    amount: new client_1.Prisma.Decimal(7200.0),
                    category: "Travel - Air",
                    expenseType: "AMOUNT_WISE",
                    multiLevelApproval: "Level 2",
                    status: "PAID",
                },
                {
                    expenseCode: "EXP5005",
                    employeeId: employee.id,
                    title: "Hotel - 1 night stay",
                    date: new Date("2026-05-14"),
                    siteName: "Bangalore",
                    amount: new client_1.Prisma.Decimal(3200.0),
                    category: "Hotel & Accommodation",
                    expenseType: "AMOUNT_WISE",
                    multiLevelApproval: "Level 1",
                    status: "PAID",
                },
                {
                    expenseCode: "EXP5006",
                    employeeId: employee.id,
                    title: "Scooter fuel - field visits",
                    date: new Date("2026-05-22"),
                    siteName: "Nashik",
                    amount: new client_1.Prisma.Decimal(360.0),
                    category: "Bike11 - petrol",
                    expenseType: "UNIT_WISE",
                    unit: "ltr",
                    unitRate: new client_1.Prisma.Decimal(120.0),
                    status: "PAID",
                },
                {
                    expenseCode: "EXP5007",
                    employeeId: employee.id,
                    title: "Printer paper & pens",
                    date: new Date("2026-05-28"),
                    siteName: "Nashik",
                    amount: new client_1.Prisma.Decimal(340.0),
                    category: "Office Supplies",
                    expenseType: "AMOUNT_WISE",
                    status: "REJECTED",
                },
                // April 2026
                {
                    expenseCode: "EXP5008",
                    employeeId: employee.id,
                    title: "Train ticket - quarterly review",
                    date: new Date("2026-04-08"),
                    siteName: "Delhi",
                    amount: new client_1.Prisma.Decimal(1100.0),
                    category: "Travel - Train",
                    expenseType: "AMOUNT_WISE",
                    status: "PAID",
                },
                {
                    expenseCode: "EXP5009",
                    employeeId: employee.id,
                    title: "Medical - eye prescription",
                    date: new Date("2026-04-17"),
                    siteName: "Nashik",
                    amount: new client_1.Prisma.Decimal(750.0),
                    category: "Medical",
                    expenseType: "AMOUNT_WISE",
                    status: "PAID",
                },
                {
                    expenseCode: "EXP5010",
                    employeeId: employee.id,
                    title: "Miscellaneous field costs",
                    date: new Date("2026-04-25"),
                    siteName: "Nashik",
                    amount: new client_1.Prisma.Decimal(420.0),
                    category: "Other",
                    expenseType: "AMOUNT_WISE",
                    status: "UNPAID",
                },
            ],
        });
        console.log("  ✓ Expenses seeded (10 records)");
    }
    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("");
    console.log("═══════════════════════════════════════════");
    console.log("  Second user ready ✓");
    console.log("═══════════════════════════════════════════");
    console.log(`  ID       : ${employee.id}`);
    console.log(`  Name     : ${employee.name}`);
    console.log(`  Email    : ${employee.email}`);
    console.log(`  Password : Priya@123`);
    console.log("═══════════════════════════════════════════");
    console.log("");
    console.log("  Login credentials summary:");
    console.log("  ┌─────────────────────────────────────┐");
    console.log("  │  User 1 → raj@gmail.com / Admin@123 │");
    console.log("  │  User 2 → priya@gmail.com / Priya@123 │");
    console.log("  └─────────────────────────────────────┘");
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
