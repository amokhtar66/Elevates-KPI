"use client";

import { useState } from "react";
import { cancelEvaluation } from "@/actions/cancel-evaluation";
import { StatusBadge, getEvaluationStatus } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
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
import { Check, Copy, X } from "lucide-react";
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
  const [bulkCopied, setBulkCopied] = useState(false);

  const evalToCancel = evaluations.find((e) => e.id === cancelId);

  function copyLink(token: string) {
    const url = `${window.location.origin}/evaluate/${token}`;
    navigator.clipboard.writeText(url);
  }

  function copyAllLinks() {
    const pendingEvals = evaluations.filter(
      (e) => !e.managerSubmittedAt && !e.cancelledAt
    );
    const links = pendingEvals
      .map(
        (e) =>
          `${e.employee.name}: ${window.location.origin}/evaluate/${e.managerFormToken}`
      )
      .join("\n");
    navigator.clipboard.writeText(links);
    setBulkCopied(true);
    setTimeout(() => setBulkCopied(false), 2000);
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <Button variant="outline" size="sm" onClick={copyAllLinks}>
          {bulkCopied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy All Links
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-3 pr-4 font-medium">Employee</th>
              <th className="py-3 pr-4 font-medium">Role</th>
              <th className="py-3 pr-4 font-medium">Manager</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation) => {
              const status = getEvaluationStatus(evaluation);
              const canCancel =
                !evaluation.managerSubmittedAt && !evaluation.cancelledAt;
              return (
                <tr
                  key={evaluation.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/companies/${companyId}/rounds/${roundId}/evaluations/${evaluation.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {evaluation.employee.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {evaluation.employee.role}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {evaluation.manager.name}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={status} />
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(evaluation.managerFormToken)}
                        aria-label="Copy Manager Link"
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copy Link
                      </Button>
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelId(evaluation.id)}
                          aria-label="Cancel"
                          className="text-destructive"
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
