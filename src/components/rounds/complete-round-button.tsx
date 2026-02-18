"use client";

import { useState } from "react";
import { completeRound } from "@/actions/rounds";
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

export function CompleteRoundButton({
  roundId,
  companyId,
}: {
  roundId: string;
  companyId: string;
}) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowDialog(true)}
      >
        Complete Round
      </Button>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete this round?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the round. Managers will no longer be able to
              submit evaluations. Pending evaluations will remain as Pending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => completeRound(roundId, companyId)}
            >
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
