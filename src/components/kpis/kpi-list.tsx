"use client";

import { deleteKpi } from "@/actions/kpis";
import { KpiFormDialog } from "./kpi-form-dialog";
import { Button } from "@/components/ui/button";
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
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface Kpi {
  id: string;
  name: string;
  formQuestion: string;
  order: number;
}

interface KpiListProps {
  employeeId: string;
  kpis: Kpi[];
}

export function KpiList({ employeeId, kpis }: KpiListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editKpi, setEditKpi] = useState<Kpi | null>(null);

  const kpiToDelete = kpis.find((k) => k.id === deleteId);

  return (
    <>
      <div className="space-y-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="flex items-start justify-between rounded-md border border-border bg-card p-3"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">{kpi.formQuestion}</p>
              <p className="text-xs text-muted-foreground">
                {kpi.name}
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Edit"
                onClick={() => setEditKpi(kpi)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Delete"
                onClick={() => setDeleteId(kpi.id)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <KpiFormDialog
        employeeId={employeeId}
        kpi={editKpi ?? undefined}
        open={!!editKpi}
        onOpenChange={(open) => {
          if (!open) setEditKpi(null);
        }}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {kpiToDelete?.name ?? "KPI"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This KPI will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteKpi(deleteId);
                setDeleteId(null);
              }}
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
