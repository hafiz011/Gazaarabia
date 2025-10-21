-- DropForeignKey
ALTER TABLE `blogs` DROP FOREIGN KEY `Blogs_categoryId_fkey`;

-- AlterTable
ALTER TABLE `blogs` ADD COLUMN `image` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `blogs` ADD CONSTRAINT `blogs_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `blog_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

