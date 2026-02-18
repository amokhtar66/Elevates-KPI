"use client";

import { deleteEmployee } from "@/actions/employees";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface EmployeeRowProps {
  employee: {
    id: string;
    name: string;
    role: string;
    companyId: string;
    managerId: string;
    _count: { kpis: number };
  };
}

export function EmployeeRow({ employee }: EmployeeRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <>
      <div className="group flex items-center justify-between rounded-md border border-border/50 bg-muted/30 px-4 py-2 transition-colors hover:bg-muted/50">
        <Link
          href={`/companies/${employee.companyId}/employees/${employee.id}`}
          className="flex flex-1 items-center gap-3"
        >
          <div>
            <span className="text-sm font-medium">{employee.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {employee.role}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {employee._count.kpis} KPIs
          </Badge>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="More">
              <MoreHorizontal className="h-3 w-3" />
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

      <EmployeeFormDialog
        companyId={employee.companyId}
        managerId={employee.managerId}
        employee={employee}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {employee.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the employee. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteEmployee(employee.id, employee.companyId)
              }
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
