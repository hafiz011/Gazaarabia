import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma :any= new PrismaClient();

async function main() {
  const adminRole = await prisma.roles.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const userRole = await prisma.roles.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user" },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.users.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Seeding completed");
}

main().finally(() => prisma.$disconnect());
