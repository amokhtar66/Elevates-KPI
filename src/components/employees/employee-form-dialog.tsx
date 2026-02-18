"use client";

import { useState } from "react";
import { createEmployee, updateEmployee } from "@/actions/employees";
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

interface EmployeeFormDialogProps {
  companyId: string;
  managerId: string;
  employee?: { id: string; name: string; role: string };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EmployeeFormDialog({
  companyId,
  managerId,
  employee,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EmployeeFormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!employee;

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = controlledOnOpenChange ?? setUncontrolledOpen;

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("companyId", companyId);
    formData.set("managerId", managerId);
    const result = isEditing
      ? await updateEmployee(employee.id, formData)
      : await createEmployee(formData);

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
            {isEditing ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee-name">Name</Label>
            <Input
              id="employee-name"
              name="name"
              defaultValue={employee?.name ?? ""}
              placeholder="Employee name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-role">Role</Label>
            <Input
              id="employee-role"
              name="role"
              defaultValue={employee?.role ?? ""}
              placeholder="e.g. Software Engineer"
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
