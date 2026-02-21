import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KpiList } from "@/components/kpis/kpi-list";
import { KpiFormDialog } from "@/components/kpis/kpi-form-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; employeeId: string }>;
}) {
  const { companyId, employeeId } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId, deletedAt: null },
    include: {
      manager: true,
      kpis: { orderBy: { order: "asc" } },
    },
  });

  if (!employee || employee.companyId !== companyId) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/companies/${companyId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-sm text-muted-foreground">
            {employee.role}, reports to {employee.manager.name}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">KPIs</h3>
          <KpiFormDialog
            employeeId={employeeId}
            trigger={
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add KPI
              </Button>
            }
          />
        </div>

        {employee.kpis.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center text-muted-foreground">
            <p className="text-sm">No KPIs defined yet</p>
            <p className="text-xs">Add KPIs to evaluate this employee</p>
          </div>
        ) : (
          <KpiList employeeId={employeeId} kpis={employee.kpis} />
        )}
      </div>
    </div>
  );
}
