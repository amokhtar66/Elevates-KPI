"use client";

import { createRound } from "@/actions/rounds";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function NewRoundButton({ companyId }: { companyId: string }) {
  return (
    <Button size="sm" onClick={() => createRound(companyId)}>
      <Plus className="mr-1 h-4 w-4" />
      New Round
    </Button>
  );
}
