/*
  Warnings:

  - A unique constraint covering the columns `[submenuId,position]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryId,position]` on the table `subcategories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[menuId,position]` on the table `submenus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `categories_submenuId_position_key` ON `categories`(`submenuId`, `position`);

-- CreateIndex
CREATE UNIQUE INDEX `subcategories_categoryId_position_key` ON `subcategories`(`categoryId`, `position`);

-- CreateIndex
CREATE UNIQUE INDEX `submenus_menuId_position_key` ON `submenus`(`menuId`, `position`);
