import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EvaluationTable } from "@/components/evaluations/evaluation-table";
import { CompleteRoundButton } from "@/components/rounds/complete-round-button";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function RoundDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; roundId: string }>;
}) {
  const { companyId, roundId } = await params;

  const round = await prisma.evaluationRound.findUnique({
    where: { id: roundId },
    include: {
      evaluations: {
        include: {
          employee: true,
          manager: true,
        },
        orderBy: { employee: { name: "asc" } },
      },
    },
  });

  if (!round || round.companyId !== companyId) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/companies/${companyId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Round {round.roundNumber}</h2>
          <StatusBadge
            status={round.status as "in_progress" | "completed"}
          />
        </div>
        {round.status === "in_progress" && (
          <CompleteRoundButton roundId={roundId} companyId={companyId} />
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        {round.evaluations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No evaluations in this round
          </p>
        ) : (
          <EvaluationTable
            evaluations={round.evaluations}
            companyId={companyId}
            roundId={roundId}
          />
        )}
      </div>
    </div>
  );
}
