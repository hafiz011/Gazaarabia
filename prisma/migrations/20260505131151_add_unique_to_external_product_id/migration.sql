/*
  Warnings:

  - A unique constraint covering the columns `[externalProductId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `products_externalProductId_key` ON `products`(`externalProductId`);
