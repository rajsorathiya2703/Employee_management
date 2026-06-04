const prisma = require("../config/prisma");

async function main() {
    await prisma.task.createMany({
        data: [
            {
                taskName: "Submit Daily Work Log & Progress Report",
                description: "Draft and submit weekly progress report.",
                priority: "IMPORTANT",
                status: "PENDING",
                dueDate: new Date("2026-06-10"),
            },
            {
                taskName: "Review HRMS Design Specifications",
                description: "Review onboarding screens from Figma.",
                priority: "BASIC",
                status: "PENDING",
                dueDate: new Date("2026-06-11"),
            },
            {
                taskName: "Update API Documentation",
                description: "Document newly added task APIs.",
                priority: "IMPORTANT",
                status: "COMPLETED",
                dueDate: new Date("2026-06-05"),
            },
            {
                taskName: "Prepare Sprint Planning Notes",
                description: "Gather requirements for next sprint.",
                priority: "BASIC",
                status: "PENDING",
                dueDate: new Date("2026-06-12"),
            },
            {
                taskName: "Fix Authentication Bugs",
                description: "Resolve JWT token refresh issues.",
                priority: "IMPORTANT",
                status: "COMPLETED",
                dueDate: new Date("2026-06-06"),
            },
            {
                taskName: "Database Schema Review",
                description: "Review PostgreSQL and Prisma schema.",
                priority: "IMPORTANT",
                status: "PENDING",
                dueDate: new Date("2026-06-13"),
            },
            {
                taskName: "Create Employee Module APIs",
                description: "Implement CRUD APIs for employees.",
                priority: "BASIC",
                status: "PENDING",
                dueDate: new Date("2026-06-15"),
            },
            {
                taskName: "Attendance Module Testing",
                description: "Perform API testing using Postman.",
                priority: "BASIC",
                status: "COMPLETED",
                dueDate: new Date("2026-06-08"),
            },
            {
                taskName: "Frontend Integration",
                description: "Connect React frontend with backend APIs.",
                priority: "IMPORTANT",
                status: "PENDING",
                dueDate: new Date("2026-06-14"),
            },
            {
                taskName: "Code Review Session",
                description: "Review code quality and architecture.",
                priority: "BASIC",
                status: "COMPLETED",
                dueDate: new Date("2026-06-09"),
            }
        ],
    });

    console.log("Tasks inserted successfully");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });