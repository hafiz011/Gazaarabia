/*
  Warnings:

  - You are about to drop the column `slug` on the `colors` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `colors_slug_key` ON `colors`;

-- AlterTable
ALTER TABLE `colors` DROP COLUMN `slug`;
