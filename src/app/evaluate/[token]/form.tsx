"use client";

import { useState } from "react";
import { submitEvaluation } from "@/actions/evaluations";
import { StarRating } from "@/components/evaluations/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface KpiData {
  id: string;
  name: string;
  formQuestion: string;
  order: number;
}

interface ManagerEvaluationFormProps {
  evaluationId: string;
  employeeName: string;
  employeeRole: string;
  kpis: KpiData[];
}

export function ManagerEvaluationForm({
  evaluationId,
  employeeName,
  employeeRole,
  kpis,
}: ManagerEvaluationFormProps) {
  const [scores, setScores] = useState<
    Record<string, { rating: number; comment: string }>
  >({});
  const [recommendations, setRecommendations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-border bg-card p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-primary mb-2">Thank You!</h1>
          <p className="text-muted-foreground">
            Your evaluation for {employeeName} has been submitted successfully.
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    setError(null);

    // Validate all KPIs have ratings
    const missingRatings = kpis.filter((kpi) => !scores[kpi.id]?.rating);
    if (missingRatings.length > 0) {
      setError("Please provide a rating for all KPIs");
      return;
    }

    if (!recommendations.trim()) {
      setError("Recommendations and Next Steps is required");
      return;
    }

    setSubmitting(true);
    const result = await submitEvaluation(evaluationId, {
      scores: kpis.map((kpi) => ({
        kpiId: kpi.id,
        managerScore: scores[kpi.id].rating,
        managerComment: scores[kpi.id].comment || undefined,
      })),
      managerRecommendations: recommendations,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Employee Evaluation
          </h1>
          <div className="mt-2">
            <p className="text-lg font-medium">{employeeName}</p>
            <p className="text-sm text-muted-foreground">{employeeRole}</p>
          </div>
        </div>

        <div className="space-y-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              data-kpi-id={kpi.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <h3 className="font-semibold mb-1">{kpi.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {kpi.formQuestion}
              </p>
              <div className="space-y-3">
                <StarRating
                  value={scores[kpi.id]?.rating ?? 0}
                  onChange={(rating) =>
                    setScores((prev) => ({
                      ...prev,
                      [kpi.id]: { ...prev[kpi.id], rating, comment: prev[kpi.id]?.comment ?? "" },
                    }))
                  }
                />
                <Textarea
                  placeholder="Optional comment..."
                  value={scores[kpi.id]?.comment ?? ""}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [kpi.id]: {
                        ...prev[kpi.id],
                        rating: prev[kpi.id]?.rating ?? 0,
                        comment: e.target.value,
                      },
                    }))
                  }
                  rows={2}
                />
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-card p-4">
            <Label htmlFor="recommendations" className="font-semibold text-base">
              Recommendations and Next Steps
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Required — provide recommendations for the employee
            </p>
            <Textarea
              id="recommendations"
              placeholder="Your recommendations and next steps for the employee..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
