"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
async function main() {
    console.log("Seeding employee credentials...");
    const hashedPassword = await bcryptjs_1.default.hash("Admin@123", 12);
    const employee = await prisma_1.default.employee.upsert({
        where: { email: "raj@gmail.com" },
        update: {
            password: hashedPassword,
            name: "Raj Sorthiya",
            phone: "9876543210",
        },
        create: {
            name: "Raj Sorthiya",
            email: "raj@gmail.com",
            password: hashedPassword,
            phone: "9876543210",
        },
    });
    console.log("─────────────────────────────────────────");
    console.log("  Employee credentials ready ✓");
    console.log("─────────────────────────────────────────");
    console.log(`  ID     : ${employee.id}`);
    console.log(`  Name   : ${employee.name}`);
    console.log(`  Email  : ${employee.email}`);
    console.log(`  Password: Admin@123`);
    console.log("─────────────────────────────────────────");
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
