-- AlterTable: Shopify variant external identity + metadata (all nullable → safe/backward-compatible)
ALTER TABLE `productvariant`
  ADD COLUMN `externalVariantId` VARCHAR(191) NULL,
  ADD COLUMN `externalProductId` VARCHAR(191) NULL,
  ADD COLUMN `inventoryItemId` VARCHAR(191) NULL,
  ADD COLUMN `externalSource` VARCHAR(191) NULL,
  ADD COLUMN `barcode` VARCHAR(191) NULL,
  ADD COLUMN `compareAtPrice` DOUBLE NULL,
  ADD COLUMN `weight` DOUBLE NULL,
  ADD COLUMN `weightUnit` VARCHAR(191) NULL,
  ADD COLUMN `taxable` BOOLEAN NULL,
  ADD COLUMN `requiresShipping` BOOLEAN NULL,
  ADD COLUMN `position` INTEGER NULL,
  ADD COLUMN `options` JSON NULL,
  ADD COLUMN `imageUrl` VARCHAR(191) NULL,
  ADD COLUMN `externalCreatedAt` DATETIME(3) NULL,
  ADD COLUMN `externalUpdatedAt` DATETIME(3) NULL;

-- Unique per (product, variant GID). Existing rows have NULL externalVariantId;
-- MySQL treats NULLs as distinct, so this is safe on current data.
CREATE UNIQUE INDEX `productvariant_product_externalVariant_key` ON `productvariant`(`productId`, `externalVariantId`);
CREATE INDEX `productvariant_externalVariantId_idx` ON `productvariant`(`externalVariantId`);
