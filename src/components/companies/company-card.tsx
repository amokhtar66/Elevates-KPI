"use client";

import { deleteCompany } from "@/actions/companies";
import { generateInitials } from "@/lib/utils";
import { CompanyFormDialog } from "./company-form-dialog";
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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    _count: { managers: number; employees: number };
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const initials = generateInitials(company.name);

  return (
    <>
      <div className="group relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <Link
            href={`/companies/${company.id}`}
            className="flex items-center gap-4 flex-1"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
              {initials}
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">
                {company.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {company._count.managers} managers &middot;{" "}
                {company._count.employees} employees
              </p>
            </div>
          </Link>

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

      <CompanyFormDialog
        company={company}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the company and all its data. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCompany(company.id)}
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
