"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export function CopyLinkButton({
  token,
  path = "evaluate",
  label = "Copy Manager Form Link",
}: {
  token: string;
  path?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = `${window.location.origin}/${path}/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {copied ? (
        <Check className="mr-2 h-4 w-4" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      {copied ? "Copied!" : label}
    </Button>
  );
}
