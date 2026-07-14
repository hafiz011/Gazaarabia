-- Protect order history: deleting a user must NOT cascade-delete their orders.
ALTER TABLE `orders` DROP FOREIGN KEY `orders_userId_fkey`;
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
