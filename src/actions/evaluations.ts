"use server";

import { prisma } from "@/lib/prisma";
import { evaluationSubmissionSchema } from "@/lib/validations";

export async function getEvaluationByToken(token: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { managerFormToken: token },
    include: {
      employee: true,
      manager: true,
      round: true,
      scores: true,
    },
  });

  return evaluation;
}

export async function snapshotKpis(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUniqueOrThrow({
    where: { id: evaluationId },
    include: { employee: { include: { kpis: { orderBy: { order: "asc" } } } } },
  });

  // Only snapshot if not already done
  if (!evaluation.snapshotKpis) {
    const snapshot = evaluation.employee.kpis.map((kpi) => ({
      id: kpi.id,
      name: kpi.name,
      formQuestion: kpi.formQuestion,
      order: kpi.order,
    }));

    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: {
        snapshotKpis: snapshot,
        managerOpened: true,
      },
    });

    return snapshot;
  }

  return evaluation.snapshotKpis as Array<{
    id: string;
    name: string;
    formQuestion: string;
    order: number;
  }>;
}

export async function submitEvaluation(
  evaluationId: string,
  data: {
    scores: Array<{
      kpiId: string;
      managerScore: number;
      managerComment?: string;
    }>;
    managerRecommendations: string;
  }
) {
  const parsed = evaluationSubmissionSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify evaluation exists and hasn't been submitted
  const evaluation = await prisma.evaluation.findUniqueOrThrow({
    where: { id: evaluationId },
    include: { round: true },
  });

  if (evaluation.managerSubmittedAt) {
    return { error: "This evaluation has already been submitted" };
  }

  if (evaluation.round.status === "completed") {
    return { error: "This round has been closed" };
  }

  if (evaluation.cancelledAt) {
    return { error: "This evaluation has been cancelled" };
  }

  // Create/update scores and mark as submitted
  await prisma.$transaction(async (tx) => {
    for (const score of parsed.data.scores) {
      await tx.evaluationScore.upsert({
        where: {
          evaluationId_kpiId: {
            evaluationId,
            kpiId: score.kpiId,
          },
        },
        create: {
          evaluationId,
          kpiId: score.kpiId,
          managerScore: score.managerScore,
          managerComment: score.managerComment ?? null,
        },
        update: {
          managerScore: score.managerScore,
          managerComment: score.managerComment ?? null,
        },
      });
    }

    await tx.evaluation.update({
      where: { id: evaluationId },
      data: {
        managerSubmittedAt: new Date(),
        managerRecommendations: parsed.data.managerRecommendations,
      },
    });
  });

  return { success: true };
}
