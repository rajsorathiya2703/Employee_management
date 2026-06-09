import prisma from "../config/prisma";

async function main(): Promise<void> {
  console.log("Seeding customers and visits...");

  const raj = await prisma.employee.upsert({
    where: { email: "raj@gmail.com" },
    update: {},
    create: {
      name: "Raj Sorathiya",
      email: "raj@gmail.com",
      password: "123456",
    },
  });

  const secondUser = await prisma.employee.upsert({
    where: { email: "priya@gmail.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@gmail.com",
      password: "123456",
    },
  });

  const customers = await Promise.all(
    [
      { name: "Acme Industries Pvt Ltd", code: "CUST001" },
      { name: "Global Tech Solutions", code: "CUST002" },
      { name: "Sunrise Healthcare", code: "CUST003" },
      { name: "Metro Retail Chain", code: "CUST004" },
      { name: "Blue Ocean Logistics", code: "CUST005" },
    ].map((c) =>
      prisma.customer.upsert({
        where: { code: c.code },
        update: { name: c.name, isActive: true },
        create: { ...c, isActive: true },
      })
    )
  );

  const existingCount = await prisma.visit.count();
  if (existingCount === 0) {
    await prisma.visit.createMany({
      data: [
        {
          employeeId: raj.id,
          customerId: customers[0].id,
          visitDate: new Date("2026-06-09"),
          purpose: "CLIENT_MEETING",
          scheduleType: "SCHEDULED",
          locationMode: "PHYSICAL",
          category: "SELF",
          remarks: "Quarterly business review meeting",
          status: "SCHEDULED",
          createdById: raj.id,
        },
        {
          employeeId: raj.id,
          customerId: customers[1].id,
          visitDate: new Date("2026-06-12"),
          purpose: "PRODUCT_DEMO",
          scheduleType: "SCHEDULED",
          locationMode: "VIRTUAL",
          category: "SELF",
          remarks: "Product demo via video call",
          status: "SCHEDULED",
          createdById: raj.id,
        },
        {
          employeeId: secondUser.id,
          customerId: customers[2].id,
          visitDate: new Date("2026-06-10"),
          purpose: "FOLLOW_UP",
          scheduleType: "SCHEDULED",
          locationMode: "PHYSICAL",
          category: "SELF",
          remarks: "Follow-up on proposal submission",
          status: "SCHEDULED",
          createdById: secondUser.id,
        },
        {
          employeeId: secondUser.id,
          customerId: customers[3].id,
          visitDate: new Date("2026-06-15"),
          purpose: "CLIENT_MEETING",
          scheduleType: "SCHEDULED",
          locationMode: "PHYSICAL",
          category: "OTHER_EMPLOYEE",
          remarks: "Visit scheduled by manager",
          status: "SCHEDULED",
          createdById: raj.id,
        },
        {
          employeeId: raj.id,
          customerId: customers[4].id,
          visitDate: new Date("2026-06-18"),
          purpose: "SITE_INSPECTION",
          scheduleType: "SCHEDULED",
          locationMode: "PHYSICAL",
          category: "VISIT_WITH",
          companionEmployeeId: secondUser.id,
          remarks: "Joint site inspection visit",
          status: "SCHEDULED",
          createdById: raj.id,
        },
      ],
    });
  }

  console.log("Customers and visits seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
