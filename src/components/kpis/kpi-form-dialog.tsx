"use client";

import { useState } from "react";
import { createKpi, updateKpi } from "@/actions/kpis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface KpiFormDialogProps {
  employeeId: string;
  kpi?: { id: string; name: string; formQuestion: string };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function KpiFormDialog({
  employeeId,
  kpi,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: KpiFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!kpi;

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("employeeId", employeeId);
    const result = isEditing
      ? await updateKpi(kpi.id, formData)
      : await createKpi(formData);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit KPI" : "Add KPI"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kpi-name">Name</Label>
            <Input
              id="kpi-name"
              name="name"
              defaultValue={kpi?.name ?? ""}
              placeholder="e.g. Campaign Performance"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kpi-question">Form Question</Label>
            <Textarea
              id="kpi-question"
              name="formQuestion"
              defaultValue={kpi?.formQuestion ?? ""}
              placeholder="The question the manager will see in the evaluation form"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save" : "Create"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
