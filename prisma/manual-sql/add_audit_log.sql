-- Adds ONLY the new audit_log table (REM-08). Safe & additive:
-- it creates a brand-new table and never alters or drops existing data.
-- Matches the Prisma model AuditLog (@@map("audit_log")).

CREATE TABLE IF NOT EXISTS `audit_log` (
    `id`        INTEGER      NOT NULL AUTO_INCREMENT,
    `actorId`   INTEGER      NOT NULL,
    `action`    VARCHAR(191) NOT NULL,
    `entity`    VARCHAR(191) NOT NULL,
    `entityId`  INTEGER      NOT NULL,
    `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
