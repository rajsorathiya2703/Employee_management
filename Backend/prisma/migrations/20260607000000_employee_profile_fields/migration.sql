-- AlterTable: add optional profile fields to Employee
ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS "firstName"     TEXT,
  ADD COLUMN IF NOT EXISTS "lastName"      TEXT,
  ADD COLUMN IF NOT EXISTS "personalEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "designation"   TEXT,
  ADD COLUMN IF NOT EXISTS "department"    TEXT,
  ADD COLUMN IF NOT EXISTS "branch"        TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfJoining" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "profilePhoto"  TEXT;
