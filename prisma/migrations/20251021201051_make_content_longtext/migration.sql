-- AlterTable
ALTER TABLE `blogs` MODIFY `content` LONGTEXT NOT NULL;

-- RedefineIndex
DROP INDEX `Blogs_slug_key` ON `blogs`;
