const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create or update roles
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

  // Create only the admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.users.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@example.com",
      password: adminPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Seeding completed: Roles (admin, customer, affiliate) + Admin user created");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
