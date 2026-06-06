-- CreateTable
CREATE TABLE "salary_slips" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "salaryMonth" TEXT NOT NULL,
    "department" TEXT NOT NULL DEFAULT '',
    "designation" TEXT NOT NULL DEFAULT '',
    "bankName" TEXT NOT NULL DEFAULT '',
    "accountNo" TEXT NOT NULL DEFAULT '',
    "panNo" TEXT NOT NULL DEFAULT '',
    "salaryMode" TEXT NOT NULL DEFAULT 'Bank Transfer',
    "monthWorkingDays" INTEGER NOT NULL DEFAULT 0,
    "presentDays" INTEGER NOT NULL DEFAULT 0,
    "paidLeaves" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unpaidLeaves" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "joiningGrossSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "earnings" JSONB NOT NULL DEFAULT '[]',
    "deductions" JSONB NOT NULL DEFAULT '[]',
    "grossSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netPay" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_slips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salary_slips_employeeId_salaryMonth_key" ON "salary_slips"("employeeId", "salaryMonth");

-- AddForeignKey
ALTER TABLE "salary_slips" ADD CONSTRAINT "salary_slips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
