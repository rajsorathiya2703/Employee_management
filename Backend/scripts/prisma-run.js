require("dotenv/config");
const { execSync } = require("child_process");
const { resolveDatabaseUrl } = require("./database-url");

process.env.DATABASE_URL = resolveDatabaseUrl();

const args = process.argv.slice(2).join(" ");
execSync(`npx prisma ${args}`, { stdio: "inherit" });
