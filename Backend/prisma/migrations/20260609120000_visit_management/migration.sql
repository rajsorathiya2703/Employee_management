-- CreateTable: customers
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: visits
CREATE TABLE `visits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `customerId` INTEGER NOT NULL,
    `visitDate` DATETIME(3) NOT NULL,
    `purpose` ENUM('CLIENT_MEETING', 'SITE_INSPECTION', 'PRODUCT_DEMO', 'FOLLOW_UP', 'SUPPORT_VISIT', 'OTHER') NOT NULL DEFAULT 'CLIENT_MEETING',
    `scheduleType` ENUM('SCHEDULED', 'UNSCHEDULED') NOT NULL DEFAULT 'SCHEDULED',
    `locationMode` ENUM('PHYSICAL', 'VIRTUAL') NOT NULL DEFAULT 'PHYSICAL',
    `category` ENUM('SELF', 'OTHER_EMPLOYEE', 'VISIT_WITH') NOT NULL DEFAULT 'SELF',
    `companionEmployeeId` INTEGER NULL,
    `remarks` TEXT NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `visits` ADD CONSTRAINT `visits_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `visits` ADD CONSTRAINT `visits_companionEmployeeId_fkey` FOREIGN KEY (`companionEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `visits` ADD CONSTRAINT `visits_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
