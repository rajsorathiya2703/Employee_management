import prisma from "./config/prisma";

async function main(): Promise<void> {
  const users = await prisma.employee.findMany();
  console.log(users);
}

main()
  .catch((err: unknown) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
