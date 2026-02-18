"use client";

import { useState } from "react";
import { updateScores, publishEvaluation } from "@/actions/scores";
import { StarDisplay, StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Score {
  id: string;
  kpiId: string;
  managerScore: number | null;
  managerComment: string | null;
  hrAdjustedScore: number | null;
  hrComment: string | null;
  showToEmployee: boolean;
  kpi: { name: string; formQuestion: string };
}

interface EvaluationReviewFormProps {
  evaluationId: string;
  companyId: string;
  roundId: string;
  scores: Score[];
  managerRecommendations: string | null;
  isPublished: boolean;
}

export function EvaluationReviewForm({
  evaluationId,
  companyId,
  roundId,
  scores: initialScores,
  managerRecommendations,
  isPublished,
}: EvaluationReviewFormProps) {
  const [scores, setScores] = useState(
    initialScores.map((s) => ({
      scoreId: s.id,
      kpiName: s.kpi.name,
      kpiQuestion: s.kpi.formQuestion,
      managerScore: s.managerScore ?? 0,
      managerComment: s.managerComment ?? "",
      hrAdjustedScore: s.hrAdjustedScore,
      hrComment: s.hrComment ?? "",
      showToEmployee: s.showToEmployee,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaveMessage(null);
    setSaving(true);

    const result = await updateScores(
      evaluationId,
      companyId,
      roundId,
      scores.map((s) => ({
        scoreId: s.scoreId,
        hrAdjustedScore: s.hrAdjustedScore,
        hrComment: s.hrComment || null,
        showToEmployee: s.showToEmployee,
      }))
    );

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaveMessage("Saved successfully");
    setTimeout(() => setSaveMessage(null), 3000);
  }

  async function handlePublish() {
    setError(null);
    const result = await publishEvaluation(evaluationId, companyId, roundId);
    if (result.success) {
      setSaveMessage("Published successfully");
    }
  }

  return (
    <div className="space-y-6">
      {scores.map((score, i) => (
        <div
          key={score.scoreId}
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div>
            <h4 className="font-semibold">{score.kpiName}</h4>
            <p className="text-xs text-muted-foreground">
              {score.kpiQuestion}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Manager Score */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Manager Score
              </p>
              <StarDisplay value={score.managerScore} />
              {score.managerComment && (
                <p className="mt-1 text-sm text-muted-foreground italic">
                  {score.managerComment}
                </p>
              )}
            </div>

            {/* HR Adjusted Score */}
            <div data-hr-score>
              <p className="text-xs text-muted-foreground mb-1">
                HR Adjusted Score
              </p>
              <StarRating
                value={score.hrAdjustedScore ?? 0}
                onChange={(val) =>
                  setScores((prev) =>
                    prev.map((s, j) =>
                      j === i ? { ...s, hrAdjustedScore: val } : s
                    )
                  )
                }
              />
            </div>
          </div>

          {/* HR Comment */}
          <div>
            <Label className="text-xs">HR Comment</Label>
            <Textarea
              data-hr-comment
              placeholder="Required if adjusting score..."
              value={score.hrComment}
              onChange={(e) =>
                setScores((prev) =>
                  prev.map((s, j) =>
                    j === i ? { ...s, hrComment: e.target.value } : s
                  )
                )
              }
              rows={2}
            />
          </div>

          {/* Show to Employee Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={score.showToEmployee}
              onCheckedChange={(checked) =>
                setScores((prev) =>
                  prev.map((s, j) =>
                    j === i ? { ...s, showToEmployee: checked } : s
                  )
                )
              }
            />
            <Label className="text-xs">Show to Employee</Label>
          </div>
        </div>
      ))}

      {/* Manager Recommendations (read-only) */}
      {managerRecommendations && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="font-semibold mb-2">
            Manager Recommendations &amp; Next Steps
          </h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {managerRecommendations}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saveMessage && (
        <p className="text-sm text-success">{saveMessage}</p>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        <Button onClick={handlePublish} variant="default">
          {isPublished ? "Republish" : "Publish"}
        </Button>
      </div>
    </div>
  );
}
