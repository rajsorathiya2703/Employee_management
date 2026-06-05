-- CreateEnum
CREATE TYPE "AdvanceSalaryStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "advance_salary_requests" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "salaryMonth" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "remark" TEXT NOT NULL,
    "status" "AdvanceSalaryStatus" NOT NULL DEFAULT 'PENDING',
    "declinedReason" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advance_salary_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "advance_salary_requests" ADD CONSTRAINT "advance_salary_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
