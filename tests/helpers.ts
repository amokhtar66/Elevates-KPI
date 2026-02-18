import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanTestData() {
  // Delete in order to respect foreign keys
  await prisma.evaluationScore.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.evaluationRound.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.company.deleteMany();
}

export async function disconnectPrisma() {
  await prisma.$disconnect();
}
