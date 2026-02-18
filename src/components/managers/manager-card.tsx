"use client";

import { deleteManager } from "@/actions/managers";
import { generateInitials } from "@/lib/utils";
import { ManagerFormDialog } from "./manager-form-dialog";
import { EmployeeRow } from "@/components/employees/employee-row";
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface Employee {
  id: string;
  name: string;
  role: string;
  companyId: string;
  managerId: string;
  _count: { kpis: number };
}

interface ManagerCardProps {
  manager: {
    id: string;
    name: string;
    companyId: string;
    _count: { employees: number };
  };
  employees?: Employee[];
}

export function ManagerCard({ manager, employees = [] }: ManagerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const initials = generateInitials(manager.name);

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <div>
              <h4 className="font-medium text-card-foreground">
                {manager.name}
              </h4>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {manager._count.employees}{" "}
                {manager._count.employees === 1 ? "report" : "reports"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <EmployeeFormDialog
              companyId={manager.companyId}
              managerId={manager.id}
              trigger={
                <Button variant="ghost" size="sm" aria-label="Add Employee">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="More">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {employees.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2 space-y-1">
            {employees.map((employee) => (
              <EmployeeRow key={employee.id} employee={employee} />
            ))}
          </div>
        )}
      </div>

      <ManagerFormDialog
        companyId={manager.companyId}
        manager={manager}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {manager.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the manager. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteManager(manager.id, manager.companyId)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
