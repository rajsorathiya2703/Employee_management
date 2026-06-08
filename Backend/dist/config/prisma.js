"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const database_url_1 = require("./database-url");
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: (0, database_url_1.resolveDatabaseUrl)(),
        },
    },
});
exports.default = prisma;
