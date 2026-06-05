-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'UNPAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('AMOUNT_WISE', 'UNIT_WISE');

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "expenseCode" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "siteName" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" TEXT NOT NULL,
    "expenseType" "ExpenseType" NOT NULL DEFAULT 'AMOUNT_WISE',
    "unit" TEXT,
    "unitRate" DECIMAL(10,2),
    "multiLevelApproval" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expenseCode_key" ON "expenses"("expenseCode");

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
