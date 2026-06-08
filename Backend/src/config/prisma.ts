import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "./database-url";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});

export default prisma;
