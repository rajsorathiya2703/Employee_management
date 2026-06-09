const fs = require("fs");
const path = require("path");

const clientSchema = path.join(
  __dirname,
  "..",
  "node_modules",
  ".prisma",
  "client",
  "schema.prisma"
);

if (!fs.existsSync(clientSchema)) {
  console.error("Prisma client not generated. Run: npm run build");
  process.exit(1);
}

const content = fs.readFileSync(clientSchema, "utf8");

if (!/provider\s*=\s*"mysql"/.test(content)) {
  console.error(
    "Prisma client was not generated for MySQL. Check prisma/schema.prisma and rebuild."
  );
  process.exit(1);
}

console.log("Prisma MySQL client verified.");
