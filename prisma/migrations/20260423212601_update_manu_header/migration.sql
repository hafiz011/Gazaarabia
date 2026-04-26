/*
  Warnings:

  - You are about to drop the column `categoryId` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `submenus` table. All the data in the column will be lost.
  - You are about to drop the column `leftCustomLinks` on the `submenus` table. All the data in the column will be lost.
  - You are about to drop the column `leftSubcategories` on the `submenus` table. All the data in the column will be lost.
  - You are about to drop the column `rightCustomLinks` on the `submenus` table. All the data in the column will be lost.
  - You are about to drop the column `rightSubcategories` on the `submenus` table. All the data in the column will be lost.
  - You are about to drop the column `subcategoryId` on the `submenus` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `menus` DROP FOREIGN KEY `menus_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `submenus` DROP FOREIGN KEY `submenus_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `submenus` DROP FOREIGN KEY `submenus_subcategoryId_fkey`;

-- DropIndex
DROP INDEX `menus_categoryId_fkey` ON `menus`;

-- DropIndex
DROP INDEX `submenus_categoryId_fkey` ON `submenus`;

-- DropIndex
DROP INDEX `submenus_subcategoryId_fkey` ON `submenus`;

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `submenuId` INTEGER NULL;

-- AlterTable
ALTER TABLE `menus` DROP COLUMN `categoryId`;

-- AlterTable
ALTER TABLE `products` MODIFY `costPrice` DOUBLE NULL;

-- AlterTable
ALTER TABLE `subcategories` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `submenus` DROP COLUMN `categoryId`,
    DROP COLUMN `leftCustomLinks`,
    DROP COLUMN `leftSubcategories`,
    DROP COLUMN `rightCustomLinks`,
    DROP COLUMN `rightSubcategories`,
    DROP COLUMN `subcategoryId`;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_submenuId_fkey` FOREIGN KEY (`submenuId`) REFERENCES `submenus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
