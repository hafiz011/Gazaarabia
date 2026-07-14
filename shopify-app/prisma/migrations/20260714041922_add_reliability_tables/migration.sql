-- CreateTable: resumable sync state
CREATE TABLE `sync_job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'idle',
    `mode` VARCHAR(191) NOT NULL DEFAULT 'full',
    `cursor` TEXT NULL,
    `lastCursor` TEXT NULL,
    `page` INTEGER NOT NULL DEFAULT 0,
    `synced` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `sync_job_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: webhook dedup
CREATE TABLE `webhook_event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `webhookId` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NULL,
    `shop` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `webhook_event_webhookId_key`(`webhookId`),
    INDEX `webhook_event_processedAt_idx`(`processedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
