-- AlterTable
ALTER TABLE `addresses` MODIFY `address1` LONGTEXT NOT NULL,
    MODIFY `address2` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `contact_us` MODIFY `subject` LONGTEXT NOT NULL,
    MODIFY `message` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `delivery_settings` MODIFY `freeDeliveryText` LONGTEXT NULL,
    MODIFY `nextDayTitle` LONGTEXT NULL,
    MODIFY `standardDeliveryTitle` LONGTEXT NULL,
    MODIFY `returnText` LONGTEXT NULL,
    MODIFY `internationalTitle` LONGTEXT NULL,
    MODIFY `internationalFreeDeliveryText` LONGTEXT NULL,
    MODIFY `internationalCustomsText` LONGTEXT NULL,
    MODIFY `internationalTrackingText` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `faqs` MODIFY `answer` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `homepage_settings` MODIFY `headerText` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `subject` LONGTEXT NOT NULL,
    MODIFY `message` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `orders_item` ADD COLUMN `externalOrderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `externalProductId` VARCHAR(191) NULL,
    ADD COLUMN `externalSource` VARCHAR(191) NULL,
    ADD COLUMN `externalVariantId` VARCHAR(191) NULL,
    ADD COLUMN `isExternalProduct` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `return_requests` MODIFY `note` LONGTEXT NULL,
    MODIFY `adminNote` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `review` MODIFY `comment` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `sellers` ADD COLUMN `lastSyncedAt` DATETIME(3) NULL,
    ADD COLUMN `shopifyAccessToken` VARCHAR(191) NULL,
    ADD COLUMN `shopifyDomain` VARCHAR(191) NULL,
    ADD COLUMN `shopifySyncEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `storeType` VARCHAR(191) NULL,
    ADD COLUMN `wooConsumerKey` VARCHAR(191) NULL,
    ADD COLUMN `wooConsumerSecret` VARCHAR(191) NULL,
    ADD COLUMN `wooSiteUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `solidarity_receipts` MODIFY `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `subcategories` ADD COLUMN `description` LONGTEXT NULL;

-- CreateTable
CREATE TABLE `store_syncs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sellerId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `syncType` VARCHAR(191) NOT NULL,
    `imported` INTEGER NOT NULL DEFAULT 0,
    `skipped` INTEGER NOT NULL DEFAULT 0,
    `error` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `store_syncs_sellerId_idx`(`sellerId`),
    INDEX `store_syncs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_syncs` ADD CONSTRAINT `store_syncs_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `sellers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
