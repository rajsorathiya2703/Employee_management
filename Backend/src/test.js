const prisma = require("./config/prisma");

async function main() {
  const users = await prisma.user.findMany();

  console.log(users);
}

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });