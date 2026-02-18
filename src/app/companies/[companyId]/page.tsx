import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManagerCard } from "@/components/managers/manager-card";
import { ManagerFormDialog } from "@/components/managers/manager-form-dialog";
import { RoundCard } from "@/components/rounds/round-card";
import { NewRoundButton } from "@/components/rounds/new-round-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users } from "lucide-react";
import Link from "next/link";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId, deletedAt: null },
  });

  if (!company) notFound();

  const [managers, rounds] = await Promise.all([
    prisma.manager.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        employees: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { kpis: true } },
          },
        },
      },
    }),
    prisma.evaluationRound.findMany({
      where: { companyId },
      orderBy: { roundNumber: "desc" },
      include: {
        evaluations: {
          select: {
            managerSubmittedAt: true,
            cancelledAt: true,
          },
        },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h2 className="text-2xl font-bold">{company.name}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left panel: Organization */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Organization
            </h3>
            <ManagerFormDialog
              companyId={companyId}
              trigger={
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Manager
                </Button>
              }
            />
          </div>

          <div className="space-y-3">
            {managers.map((manager) => (
              <ManagerCard
                key={manager.id}
                manager={{
                  ...manager,
                  _count: { employees: manager.employees.length },
                }}
                employees={manager.employees.map((e) => ({
                  ...e,
                  companyId,
                  managerId: manager.id,
                }))}
              />
            ))}
          </div>

          {managers.length === 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center text-muted-foreground">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <p className="text-sm">No managers yet</p>
              <p className="text-xs">
                Add managers to build your organization
              </p>
            </div>
          )}
        </div>

        {/* Right panel: Rounds */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Evaluation Rounds</h3>
            <NewRoundButton companyId={companyId} />
          </div>

          <div className="space-y-3">
            {rounds.map((round) => (
              <RoundCard
                key={round.id}
                round={round}
                companyId={companyId}
              />
            ))}
          </div>

          {rounds.length === 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center text-muted-foreground">
              <p className="text-sm">No rounds yet</p>
              <p className="text-xs">
                Start a new round to begin evaluations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
