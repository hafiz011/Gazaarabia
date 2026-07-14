-- Shopify order mapping/status fields on order items (all nullable → safe).
ALTER TABLE `orders_item`
  ADD COLUMN `externalOrderName` VARCHAR(191) NULL,
  ADD COLUMN `externalFinancialStatus` VARCHAR(191) NULL,
  ADD COLUMN `trackingNumber` VARCHAR(191) NULL,
  ADD COLUMN `trackingCompany` VARCHAR(191) NULL,
  ADD COLUMN `trackingUrl` LONGTEXT NULL,
  ADD COLUMN `externalSyncedAt` DATETIME(3) NULL;
