-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "refreshToken" TEXT;
