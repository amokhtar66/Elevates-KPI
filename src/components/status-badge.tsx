import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "in_progress"
  | "completed"
  | "pending"
  | "submitted"
  | "published"
  | "cancelled";

const statusConfig: Record<Status, { label: string; className: string }> = {
  in_progress: {
    label: "In Progress",
    className: "bg-warning-bg text-warning border-warning/30",
  },
  completed: {
    label: "Completed",
    className: "bg-success-bg text-success border-success/30",
  },
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  },
  submitted: {
    label: "Submitted",
    className: "bg-primary/10 text-primary border-primary/30",
  },
  published: {
    label: "Published",
    className: "bg-success-bg text-success border-success/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground opacity-60",
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-xs", config.className)}>
      {config.label}
    </Badge>
  );
}

export function getEvaluationStatus(evaluation: {
  cancelledAt: Date | null;
  hrPublished: boolean;
  managerSubmittedAt: Date | null;
}): Status {
  if (evaluation.cancelledAt) return "cancelled";
  if (evaluation.hrPublished) return "published";
  if (evaluation.managerSubmittedAt) return "submitted";
  return "pending";
}
