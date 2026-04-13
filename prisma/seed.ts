import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ---- Roles ----
  const adminRole = await prisma.roles.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  await prisma.roles.upsert({
    where: { name: "customer" },
    update: {},
    create: { name: "customer" },
  });

  await prisma.roles.upsert({
    where: { name: "affiliate" },
    update: {},
    create: { name: "affiliate" },
  });

  await prisma.roles.upsert({
    where: { name: "content_manager" },
    update: {},
    create: { name: "content_manager" },
  });

  await prisma.roles.upsert({
    where: { name: "seller" },
    update: {},
    create: { name: "seller" },
  });

  // ---- Admin user ----
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "info@gazaarabia.com";
  const adminName = process.env.SEED_ADMIN_NAME || "Super Admin";
  const adminPlainPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPlainPassword || adminPlainPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD is required and must be at least 12 characters.");
  }

  const adminPasswordHash = await bcrypt.hash(adminPlainPassword, 12);

  await prisma.users.upsert({
    where: { email: adminEmail },
    update: {
      // Ensure admin role is correct; don't overwrite password by default.
      roleId: adminRole.id,
    },
    create: {
      name: adminName,
      email: adminEmail,
      password: adminPasswordHash,
      roleId: adminRole.id,
    },
  });

  await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      defaultCommissionValue: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })


  console.log("✅ Seeding completed: roles + admin user ensured");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
