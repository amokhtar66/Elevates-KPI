import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@elevates.com" },
    update: {},
    create: {
      email: "admin@elevates.com",
      hashedPassword: hashSync("admin123", 12),
      name: "HR Admin",
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
