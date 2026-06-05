-- CreateEnum
CREATE TYPE "AttendanceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateEnum
CREATE TYPE "AttendanceRequestType" AS ENUM ('PUNCH_IN_ADJUSTMENT', 'PUNCH_OUT_ADJUSTMENT', 'FULL_DAY_PRESENT', 'HALF_DAY_PRESENT', 'WORK_FROM_HOME', 'OTHER');

-- CreateTable
CREATE TABLE "attendance_requests" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AttendanceRequestType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AttendanceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attendance_requests" ADD CONSTRAINT "attendance_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
