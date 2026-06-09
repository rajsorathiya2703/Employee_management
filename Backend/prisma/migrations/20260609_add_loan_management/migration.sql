-- CreateEnum
CREATE TYPE `LoanStatus` AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'REPAID');

-- CreateTable
CREATE TABLE `loan_requests` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `employeeId` INT NOT NULL,
    `loanAmount` DECIMAL(65,30) NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `repaymentPeriod` INT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED', 'REPAID') NOT NULL DEFAULT 'PENDING',
    `approvedAmount` DECIMAL(65,30),
    `disbursedAmount` DECIMAL(65,30),
    `approvedAt` DATETIME(3),
    `rejectionReason` VARCHAR(191),
    `disbursedAt` DATETIME(3),
    `repaidAt` DATETIME(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `loan_requests_employeeId_idx` ON `loan_requests`(`employeeId`);
