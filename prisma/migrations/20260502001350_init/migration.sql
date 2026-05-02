/*
  Warnings:

  - You are about to drop the `platformsettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `platformsettings`;

-- CreateTable
CREATE TABLE `platform_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `defaultCommissionValue` DOUBLE NOT NULL DEFAULT 5,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
