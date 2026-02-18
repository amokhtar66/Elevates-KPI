import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge, getEvaluationStatus } from "@/components/status-badge";
import { EvaluationReviewForm } from "@/components/evaluations/evaluation-review-form";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{
    companyId: string;
    roundId: string;
    evaluationId: string;
  }>;
}) {
  const { companyId, roundId, evaluationId } = await params;

  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      employee: true,
      manager: true,
      round: true,
      scores: {
        include: { kpi: true },
        orderBy: { kpi: { order: "asc" } },
      },
    },
  });

  if (!evaluation || evaluation.round.companyId !== companyId) notFound();

  const status = getEvaluationStatus(evaluation);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/companies/${companyId}/rounds/${roundId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{evaluation.employee.name}</h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {evaluation.employee.role} — Manager: {evaluation.manager.name}
          </p>
        </div>
      </div>

      {!evaluation.managerSubmittedAt ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-lg font-medium mb-2">
            Awaiting Manager Submission
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            The manager has not submitted their evaluation yet. Share the form
            link below.
          </p>
          <CopyLinkButton token={evaluation.managerFormToken} label="Copy Manager Form Link" />
        </div>
      ) : (
        <EvaluationReviewForm
          evaluationId={evaluationId}
          companyId={companyId}
          roundId={roundId}
          scores={evaluation.scores}
          managerRecommendations={evaluation.managerRecommendations}
          isPublished={evaluation.hrPublished}
        />
      )}
    </div>
  );
}

