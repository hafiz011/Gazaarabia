-- DropIndex
DROP INDEX `products_externalProductId_key` ON `products`;

-- CreateIndex
CREATE UNIQUE INDEX `products_sellerId_externalProductId_key` ON `products`(`sellerId`, `externalProductId`);
