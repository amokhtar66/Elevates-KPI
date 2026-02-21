"use client";

import { useState } from "react";
import { shareWithEmployee } from "@/actions/scores";
import { Button } from "@/components/ui/button";
import { Check, Share2 } from "lucide-react";

interface ShareWithEmployeeButtonProps {
  evaluationId: string;
  companyId: string;
  roundId: string;
  employeeViewToken: string;
  isPublished: boolean;
}

export function ShareWithEmployeeButton({
  evaluationId,
  companyId,
  roundId,
  employeeViewToken,
  isPublished,
}: ShareWithEmployeeButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (!isPublished) {
      await shareWithEmployee(evaluationId, companyId, roundId);
    }

    const url = `${window.location.origin}/scores/${employeeViewToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button onClick={handleShare} variant="default">
      {copied ? (
        <>
          <Check className="mr-1 h-4 w-4" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="mr-1 h-4 w-4" />
          {isPublished ? "Reshare with Employee" : "Share with Employee"}
        </>
      )}
    </Button>
  );
}
