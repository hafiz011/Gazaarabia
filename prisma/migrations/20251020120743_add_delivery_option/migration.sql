-- CreateTable
CREATE TABLE `DeliveryOption` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `minTime` INTEGER NOT NULL,
    `maxTime` INTEGER NOT NULL,
    `cutOffTime` VARCHAR(191) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `freeOver` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
