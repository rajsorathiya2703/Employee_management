import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

async function main(): Promise<void> {
  console.log("Seeding employee credentials...");

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  const employee = await prisma.employee.upsert({
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
    await prisma.$disconnect();
  });
