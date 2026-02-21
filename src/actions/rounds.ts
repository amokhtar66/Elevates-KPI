"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRound(companyId: string) {
  // Transaction: complete previous in-progress round + create new + generate evaluations
  await prisma.$transaction(async (tx) => {
    // 1. Complete any in-progress round for this company
    await tx.evaluationRound.updateMany({
      where: { companyId, status: "in_progress" },
      data: { status: "completed" },
    });

    // 2. Get next round number
    const lastRound = await tx.evaluationRound.findFirst({
      where: { companyId },
      orderBy: { roundNumber: "desc" },
    });
    const roundNumber = (lastRound?.roundNumber ?? 0) + 1;

    // 3. Create new round
    const round = await tx.evaluationRound.create({
      data: { companyId, roundNumber },
    });

    // 4. Get all active employees with their managers
    const employees = await tx.employee.findMany({
      where: { companyId, deletedAt: null },
    });

    // 5. Generate one evaluation per employee
    if (employees.length > 0) {
      await tx.evaluation.createMany({
        data: employees.map((emp) => ({
          roundId: round.id,
          employeeId: emp.id,
          managerId: emp.managerId,
        })),
      });
    }
  });

  revalidatePath(`/companies/${companyId}`);
}

export async function getRounds(companyId: string) {
  return prisma.evaluationRound.findMany({
    where: { companyId },
    orderBy: { roundNumber: "desc" },
    include: {
      evaluations: {
        include: {
          employee: true,
          manager: true,
        },
      },
    },
  });
}

export async function updateRoundName(
  roundId: string,
  name: string,
  companyId: string
) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { error: "Round name is required" };
  }

  // Check for duplicate name within the same company
  const existing = await prisma.evaluationRound.findFirst({
    where: {
      companyId,
      name: trimmed,
      id: { not: roundId },
    },
  });

  if (existing) {
    return { error: "A round with this name already exists for this company" };
  }

  await prisma.evaluationRound.update({
    where: { id: roundId },
    data: { name: trimmed },
  });

  revalidatePath(`/companies/${companyId}`);
  revalidatePath(`/companies/${companyId}/rounds/${roundId}`);
  return { success: true };
}

export async function completeRound(roundId: string, companyId: string) {
  await prisma.evaluationRound.update({
    where: { id: roundId },
    data: { status: "completed" },
  });

  revalidatePath(`/companies/${companyId}`);
}
