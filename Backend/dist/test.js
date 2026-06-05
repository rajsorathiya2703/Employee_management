"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./config/prisma"));
async function main() {
    const users = await prisma_1.default.employee.findMany();
    console.log(users);
}
main()
    .catch((err) => {
    console.error(err);
})
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
