"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateScores(
  evaluationId: string,
  companyId: string,
  roundId: string,
  data: {
    scores: Array<{
      scoreId: string;
      managerScore: number;
      managerComment: string | null;
    }>;
    managerRecommendations: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      for (const score of data.scores) {
        await tx.evaluationScore.update({
          where: { id: score.scoreId },
          data: {
            managerScore: score.managerScore,
            managerComment: score.managerComment,
          },
        });
      }

      await tx.evaluation.update({
        where: { id: evaluationId },
        data: { managerRecommendations: data.managerRecommendations },
      });
    });

    revalidatePath(
      `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
    );
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save changes" };
  }
}

export async function shareWithEmployee(
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
