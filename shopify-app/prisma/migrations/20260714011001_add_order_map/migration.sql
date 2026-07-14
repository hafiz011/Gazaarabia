-- CreateTable
CREATE TABLE `order_map` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop` VARCHAR(191) NOT NULL,
    `gazaOrderId` VARCHAR(191) NOT NULL,
    `shopifyOrderGid` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NULL,
    `orderName` VARCHAR(191) NULL,
    `financialStatus` VARCHAR(191) NULL,
    `fulfillmentStatus` VARCHAR(191) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `syncedAt` DATETIME(3) NULL,

    UNIQUE INDEX `order_map_shop_gazaOrderId_key`(`shop`, `gazaOrderId`),
    INDEX `order_map_shopifyOrderGid_idx`(`shopifyOrderGid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
