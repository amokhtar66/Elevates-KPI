"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateScores(
  evaluationId: string,
  companyId: string,
  roundId: string,
  scores: Array<{
    scoreId: string;
    hrAdjustedScore: number | null;
    hrComment: string | null;
    showToEmployee: boolean;
  }>
) {
  // Validate: if HR adjusted score is set, HR comment is required
  for (const score of scores) {
    if (score.hrAdjustedScore !== null && !score.hrComment?.trim()) {
      return { error: "HR comment is required when adjusting a score" };
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const score of scores) {
      await tx.evaluationScore.update({
        where: { id: score.scoreId },
        data: {
          hrAdjustedScore: score.hrAdjustedScore,
          hrComment: score.hrComment,
          showToEmployee: score.showToEmployee,
        },
      });
    }
  });

  revalidatePath(
    `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
  );
  return { success: true };
}

export async function publishEvaluation(
  evaluationId: string,
  companyId: string,
  roundId: string
) {
  await prisma.evaluation.update({
    where: { id: evaluationId },
    data: { hrPublished: true },
  });

  revalidatePath(
    `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
  );
  revalidatePath(`/companies/${companyId}/rounds/${roundId}`);
  return { success: true };
}

export async function getEmployeeScores(token: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { employeeViewToken: token },
    include: {
      employee: true,
      round: true,
      scores: {
        include: { kpi: true },
        orderBy: { kpi: { order: "asc" } },
      },
    },
  });

  return evaluation;
}
