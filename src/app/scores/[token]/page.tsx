import { notFound } from "next/navigation";
import { getEmployeeScores } from "@/actions/scores";
import { StarDisplay } from "@/components/evaluations/star-rating";

export default async function EmployeeScorePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const evaluation = await getEmployeeScores(token);
  if (!evaluation) notFound();

  if (!evaluation.hrPublished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold mb-2">Not Available</h1>
          <p className="text-muted-foreground">
            Your evaluation results have not been published yet. Please check
            back later.
          </p>
        </div>
      </div>
    );
  }

  // Filter visible scores
  const visibleScores = evaluation.scores.filter((s) => s.showToEmployee);

  // Calculate overall score (HR-adjusted takes priority)
  const scoreValues = visibleScores.map(
    (s) => s.hrAdjustedScore ?? s.managerScore ?? 0
  );
  const overallScore =
    scoreValues.length > 0
      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-1">
            Evaluation Results
          </h1>
          <p className="text-lg font-medium">{evaluation.employee.name}</p>
          <p className="text-sm text-muted-foreground">
            {evaluation.employee.role}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Round {evaluation.round.roundNumber}
          </p>
        </div>

        {/* Overall Score */}
        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
          <p className="text-4xl font-bold text-primary">
            {overallScore.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">out of 5.0</p>
        </div>

        {/* Individual KPI Scores */}
        <div className="space-y-4">
          {visibleScores.map((score) => {
            const displayScore =
              score.hrAdjustedScore ?? score.managerScore ?? 0;
            return (
              <div
                key={score.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{score.kpi.name}</h3>
                  <StarDisplay value={displayScore} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {score.kpi.formQuestion}
                </p>
                {score.managerComment && (
                  <p className="text-sm text-muted-foreground italic">
                    {score.managerComment}
                  </p>
                )}
                {score.hrComment && (
                  <p className="text-sm text-muted-foreground italic mt-1">
                    {score.hrComment}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Manager Recommendations */}
        {evaluation.managerRecommendations && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold mb-2">
              Recommendations &amp; Next Steps
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {evaluation.managerRecommendations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
