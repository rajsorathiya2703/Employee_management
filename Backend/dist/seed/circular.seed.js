"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../config/prisma"));
async function main() {
    await prisma_1.default.circular.createMany({
        data: [
            {
                circularTitle: "Diwali Celebration & Office Holidays",
                circularDescription: "Office will remain closed for Diwali.",
                circularPostDate: new Date("2026-05-11"),
                circularPostTime: "09:51 PM",
            },
            {
                circularTitle: "Quarterly Town Hall Meeting",
                circularDescription: "Quarterly business review meeting.",
                circularPostDate: new Date("2026-05-07"),
                circularPostTime: "10:51 PM",
            },
            {
                circularTitle: "Updated Work From Home Policy",
                circularDescription: "WFH policy updated effective June.",
                circularPostDate: new Date("2026-05-02"),
                circularPostTime: "08:30 AM",
            },
        ],
    });
    console.log("Circulars Seeded Successfully");
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma_1.default.$disconnect();
});
