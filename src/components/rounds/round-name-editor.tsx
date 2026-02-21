"use client";

import { useState } from "react";
import { updateRoundName } from "@/actions/rounds";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";

interface RoundNameEditorProps {
  roundId: string;
  companyId: string;
  currentName: string | null;
  roundNumber: number;
}

export function RoundNameEditor({
  roundId,
  companyId,
  currentName,
  roundNumber,
}: RoundNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName ?? `Round ${roundNumber}`);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displayName = currentName || `Round ${roundNumber}`;

  async function handleSave() {
    setError(null);
    setSaving(true);
    const result = await updateRoundName(roundId, name, companyId);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        onClick={() => {
          setName(currentName ?? `Round ${roundNumber}`);
          setEditing(true);
        }}
        className="group flex items-center gap-1.5 text-left"
      >
        <span className="text-2xl font-bold">{displayName}</span>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 w-56 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={saving}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setEditing(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
