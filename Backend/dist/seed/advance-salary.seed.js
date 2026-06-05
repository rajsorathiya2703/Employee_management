"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
async function main() {
    console.log("Seeding advance salary requests...");
    // Seed for both employees (idempotent — skip if already exist)
    const employees = await prisma_1.default.employee.findMany({
        select: { id: true, email: true },
    });
    for (const emp of employees) {
        const existing = await prisma_1.default.advanceSalaryRequest.count({
            where: { employeeId: emp.id },
        });
        if (existing > 0) {
            console.log(`  ↳ Skipping ${emp.email} — already has data`);
            continue;
        }
        if (emp.email === "raj@gmail.com") {
            await prisma_1.default.advanceSalaryRequest.createMany({
                data: [
                    {
                        employeeId: emp.id,
                        salaryMonth: "2025-08",
                        amount: new client_1.Prisma.Decimal(10000),
                        remark: "Please send me I am at medical",
                        status: "PENDING",
                    },
                    {
                        employeeId: emp.id,
                        salaryMonth: "2025-06",
                        amount: new client_1.Prisma.Decimal(7500),
                        remark: "Home repair urgency",
                        status: "APPROVED",
                        resolvedAt: new Date("2025-06-10"),
                    },
                    {
                        employeeId: emp.id,
                        salaryMonth: "2025-04",
                        amount: new client_1.Prisma.Decimal(5000),
                        remark: "Wedding expenses",
                        status: "DECLINED",
                        declinedReason: "Monthly limit exceeded",
                        resolvedAt: new Date("2025-04-08"),
                    },
                ],
            });
            console.log(`  ✓ Seeded 3 records for ${emp.email}`);
        }
        if (emp.email === "priya@gmail.com") {
            await prisma_1.default.advanceSalaryRequest.createMany({
                data: [
                    {
                        employeeId: emp.id,
                        salaryMonth: "2026-05",
                        amount: new client_1.Prisma.Decimal(8000),
                        remark: "Child school fee",
                        status: "APPROVED",
                        resolvedAt: new Date("2026-05-05"),
                    },
                    {
                        employeeId: emp.id,
                        salaryMonth: "2026-04",
                        amount: new client_1.Prisma.Decimal(4000),
                        remark: "Vehicle repair",
                        status: "DECLINED",
                        declinedReason: "Insufficient salary balance",
                        resolvedAt: new Date("2026-04-03"),
                    },
                    {
                        employeeId: emp.id,
                        salaryMonth: "2026-06",
                        amount: new client_1.Prisma.Decimal(6000),
                        remark: "Medical emergency",
                        status: "PENDING",
                    },
                ],
            });
            console.log(`  ✓ Seeded 3 records for ${emp.email}`);
        }
    }
    console.log("Advance salary requests seeded successfully ✓");
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
