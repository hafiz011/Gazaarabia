-- Additive indexes on frequently-queried, previously-unindexed columns.
CREATE INDEX `orders_transactionId_idx` ON `orders`(`transactionId`);
CREATE INDEX `orders_couponCode_idx` ON `orders`(`couponCode`);
CREATE INDEX `orders_item_externalOrderId_idx` ON `orders_item`(`externalOrderId`);
CREATE INDEX `sellers_shopifyDomain_idx` ON `sellers`(`shopifyDomain`);
