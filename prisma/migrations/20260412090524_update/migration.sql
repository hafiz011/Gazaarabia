/*
  Warnings:

  - You are about to drop the column `commissionType` on the `category_commissions` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `category_commissions` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCommissionType` on the `platformsettings` table. All the data in the column will be lost.
  - You are about to drop the column `commissionType` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `commissionType` on the `sellers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `category_commissions` DROP FOREIGN KEY `category_commissions_subcategoryId_fkey`;

-- DropIndex
DROP INDEX `category_commissions_subcategoryId_fkey` ON `category_commissions`;

-- AlterTable
ALTER TABLE `category_commissions` DROP COLUMN `commissionType`,
    DROP COLUMN `subcategoryId`;

-- AlterTable
ALTER TABLE `platformsettings` DROP COLUMN `defaultCommissionType`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `commissionType`;

-- AlterTable
ALTER TABLE `sellers` DROP COLUMN `commissionType`,
    MODIFY `isActive` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `SubcategoryCommission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subcategoryId` INTEGER NOT NULL,
    `commission` DOUBLE NOT NULL DEFAULT 5,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `SubcategoryCommission_subcategoryId_key`(`subcategoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubcategoryCommission` ADD CONSTRAINT `SubcategoryCommission_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
