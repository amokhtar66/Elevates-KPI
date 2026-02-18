"use client";

import { useState } from "react";
import { createCompany, updateCompany } from "@/actions/companies";
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

interface CompanyFormDialogProps {
  company?: { id: string; name: string };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CompanyFormDialog({
  company,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CompanyFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!company;

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isEditing
      ? await updateCompany(company.id, formData)
      : await createCompany(formData);

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
            {isEditing ? "Edit Company" : "Add Company"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Name</Label>
            <Input
              id="company-name"
              name="name"
              defaultValue={company?.name ?? ""}
              placeholder="Company name"
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
