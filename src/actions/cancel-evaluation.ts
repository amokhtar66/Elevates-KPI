"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelEvaluation(
  evaluationId: string,
  companyId: string,
  roundId: string
) {
  await prisma.evaluation.update({
    where: { id: evaluationId },
    data: { cancelledAt: new Date() },
  });

  revalidatePath(`/companies/${companyId}/rounds/${roundId}`);
}
