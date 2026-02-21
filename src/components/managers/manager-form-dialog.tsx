"use client";

import { useState } from "react";
import { createManager, updateManager } from "@/actions/managers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ManagerFormDialogProps {
  companyId: string;
  manager?: { id: string; name: string; title?: string | null };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManagerFormDialog({
  companyId,
  manager,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ManagerFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!manager;

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("companyId", companyId);
    const result = isEditing
      ? await updateManager(manager.id, formData)
      : await createManager(formData);

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
          <DialogTitle>
            {isEditing ? "Edit Manager" : "Add Manager"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manager-name">Name</Label>
            <Input
              id="manager-name"
              name="name"
              defaultValue={manager?.name ?? ""}
              placeholder="Manager name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager-title">Job Title</Label>
            <Input
              id="manager-title"
              name="title"
              defaultValue={manager?.title ?? ""}
              placeholder="e.g. Engineering Manager"
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
