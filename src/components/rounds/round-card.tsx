import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface RoundCardProps {
  round: {
    id: string;
    roundNumber: number;
    name: string | null;
    status: string;
    evaluations: Array<{
      managerSubmittedAt: Date | null;
      cancelledAt: Date | null;
    }>;
  };
  companyId: string;
}

export function RoundCard({ round, companyId }: RoundCardProps) {
  const activeEvals = round.evaluations.filter((e) => !e.cancelledAt);
  const submitted = activeEvals.filter((e) => e.managerSubmittedAt).length;
  const total = activeEvals.length;
  const progress = total > 0 ? (submitted / total) * 100 : 0;

  return (
    <Link href={`/companies/${companyId}/rounds/${round.id}`}>
      <div className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">{round.name || `Round ${round.roundNumber}`}</h4>
          <StatusBadge
            status={round.status as "in_progress" | "completed"}
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {submitted}/{total} submitted
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </Link>
  );
}
