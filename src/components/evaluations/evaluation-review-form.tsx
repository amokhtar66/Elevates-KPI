"use client";

import { useState } from "react";
import { updateScores } from "@/actions/scores";
import { StarDisplay, StarRating } from "./star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

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
  managerRecommendations: initialRecommendations,
}: EvaluationReviewFormProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [scores, setScores] = useState(
    initialScores.map((s) => ({
      scoreId: s.id,
      kpiName: s.kpi.name,
      kpiQuestion: s.kpi.formQuestion,
      managerScore: s.managerScore ?? 0,
      managerComment: s.managerComment ?? "",
    }))
  );
  const [recommendations, setRecommendations] = useState(
    initialRecommendations ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError(null);
    setSaveMessage(null);
    setSaving(true);

    const result = await updateScores(evaluationId, companyId, roundId, {
      scores: scores.map((s) => ({
        scoreId: s.scoreId,
        managerScore: s.managerScore,
        managerComment: s.managerComment || null,
      })),
      managerRecommendations: recommendations,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaveMessage("Saved successfully");
    setIsEditMode(false);
    setTimeout(() => setSaveMessage(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Evaluation Scores</h3>
        {!isEditMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            <Pencil className="mr-1 h-3 w-3" />
            Edit Mode
          </Button>
        )}
      </div>

      {scores.map((score, i) => (
        <div
          key={score.scoreId}
          className="rounded-lg border border-border bg-card p-4 space-y-3"
        >
          <div>
            <h4 className="font-semibold">{score.kpiQuestion}</h4>
            <p className="text-xs text-muted-foreground">{score.kpiName}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Score</p>
            {isEditMode ? (
              <StarRating
                value={score.managerScore}
                onChange={(val) =>
                  setScores((prev) =>
                    prev.map((s, j) =>
                      j === i ? { ...s, managerScore: val } : s
                    )
                  )
                }
              />
            ) : (
              <StarDisplay value={score.managerScore} />
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Comment</p>
            {isEditMode ? (
              <Textarea
                placeholder="Add a comment"
                value={score.managerComment}
                onChange={(e) =>
                  setScores((prev) =>
                    prev.map((s, j) =>
                      j === i ? { ...s, managerComment: e.target.value } : s
                    )
                  )
                }
                rows={2}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {score.managerComment || "—"}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Recommendations */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="font-semibold mb-2">
          Recommendations &amp; Next Steps
        </h4>
        {isEditMode ? (
          <Textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            rows={4}
            placeholder="Recommendations and next steps..."
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {recommendations || "—"}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saveMessage && (
        <p className="text-sm text-success">{saveMessage}</p>
      )}

      {isEditMode && (
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
