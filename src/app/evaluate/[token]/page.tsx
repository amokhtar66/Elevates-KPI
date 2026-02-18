import { getEvaluationByToken, snapshotKpis } from "@/actions/evaluations";
import { notFound } from "next/navigation";
import { ManagerEvaluationForm } from "./form";

export default async function EvaluatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const evaluation = await getEvaluationByToken(token);
  if (!evaluation) notFound();

  // Already submitted
  if (evaluation.managerSubmittedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-primary mb-2">
            Already Submitted
          </h1>
          <p className="text-muted-foreground">
            This evaluation for {evaluation.employee.name} has already been
            submitted. Thank you for your feedback.
          </p>
        </div>
      </div>
    );
  }

  // Round closed
  if (evaluation.round.status === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold mb-2">Round Closed</h1>
          <p className="text-muted-foreground">
            This evaluation round has been closed. Submissions are no longer
            accepted.
          </p>
        </div>
      </div>
    );
  }

  // Cancelled
  if (evaluation.cancelledAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold mb-2">Evaluation Cancelled</h1>
          <p className="text-muted-foreground">
            This evaluation has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  // Snapshot KPIs on first open
  const kpis = await snapshotKpis(evaluation.id);

  return (
    <ManagerEvaluationForm
      evaluationId={evaluation.id}
      employeeName={evaluation.employee.name}
      employeeRole={evaluation.employee.role}
      kpis={kpis}
    />
  );
}
