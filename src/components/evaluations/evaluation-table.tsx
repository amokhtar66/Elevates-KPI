"use client";

import { useState } from "react";
import { cancelEvaluation } from "@/actions/cancel-evaluation";
import { StatusBadge, getEvaluationStatus } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, Copy, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";

interface Evaluation {
  id: string;
  managerFormToken: string;
  employeeViewToken: string;
  managerSubmittedAt: Date | null;
  hrPublished: boolean;
  cancelledAt: Date | null;
  employee: { id: string; name: string; role: string };
  manager: { name: string };
}

interface EvaluationTableProps {
  evaluations: Evaluation[];
  companyId: string;
  roundId: string;
}

export function EvaluationTable({
  evaluations,
  companyId,
  roundId,
}: EvaluationTableProps) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [copiedManager, setCopiedManager] = useState<string | null>(null);

  const evalToCancel = evaluations.find((e) => e.id === cancelId);

  // Group evaluations by manager
  const byManager = new Map<string, Evaluation[]>();
  for (const evaluation of evaluations) {
    const key = evaluation.manager.name;
    if (!byManager.has(key)) byManager.set(key, []);
    byManager.get(key)!.push(evaluation);
  }

  function copyManagerLinks(managerName: string) {
    const managerEvals = byManager.get(managerName) ?? [];
    const pending = managerEvals.filter(
      (e) => !e.managerSubmittedAt && !e.cancelledAt
    );
    const links = pending
      .map(
        (e) =>
          `${e.employee.name}\n${window.location.origin}/evaluate/${e.managerFormToken}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(links);
    setCopiedManager(managerName);
    setTimeout(() => setCopiedManager(null), 2000);
  }

  return (
    <>
      <div className="space-y-6">
        {Array.from(byManager.entries()).map(
          ([managerName, managerEvals]) => (
            <div key={managerName}>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {managerName}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyManagerLinks(managerName)}
                >
                  {copiedManager === managerName ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy Links
                    </>
                  )}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Employee</th>
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerEvals.map((evaluation) => {
                      const status = getEvaluationStatus(evaluation);
                      const canCancel =
                        !evaluation.managerSubmittedAt &&
                        !evaluation.cancelledAt;
                      return (
                        <tr
                          key={evaluation.id}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2 pr-4">
                            <Link
                              href={`/companies/${companyId}/rounds/${roundId}/evaluations/${evaluation.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {evaluation.employee.name}
                            </Link>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground">
                            {evaluation.employee.role}
                          </td>
                          <td className="py-2 pr-4">
                            <StatusBadge status={status} />
                          </td>
                          <td className="py-2">
                            {canCancel && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="More"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setCancelId(evaluation.id)
                                    }
                                    className="text-destructive"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel Evaluation
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      <AlertDialog
        open={!!cancelId}
        onOpenChange={(open) => {
          if (!open) setCancelId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel evaluation for {evalToCancel?.employee.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the evaluation. The manager will no longer be
              able to submit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelId)
                  cancelEvaluation(cancelId, companyId, roundId);
                setCancelId(null);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Cancel Evaluation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
