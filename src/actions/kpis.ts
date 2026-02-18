"use server";

import { prisma } from "@/lib/prisma";
import { kpiSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createKpi(formData: FormData) {
  const parsed = kpiSchema.safeParse({
    name: formData.get("name"),
    formQuestion: formData.get("formQuestion"),
    employeeId: formData.get("employeeId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Get the next order number
  const lastKpi = await prisma.kpi.findFirst({
    where: { employeeId: parsed.data.employeeId },
    orderBy: { order: "desc" },
  });

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: parsed.data.employeeId },
  });

  await prisma.kpi.create({
    data: {
      name: parsed.data.name,
      formQuestion: parsed.data.formQuestion,
      employeeId: parsed.data.employeeId,
      order: (lastKpi?.order ?? 0) + 1,
    },
  });

  revalidatePath(
    `/companies/${employee.companyId}/employees/${parsed.data.employeeId}`
  );
}

export async function updateKpi(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const formQuestion = formData.get("formQuestion") as string;

  if (!name?.trim()) return { error: "KPI name is required" };
  if (!formQuestion?.trim()) return { error: "Form question is required" };

  const kpi = await prisma.kpi.update({
    where: { id },
    data: { name, formQuestion },
    include: { employee: true },
  });

  revalidatePath(
    `/companies/${kpi.employee.companyId}/employees/${kpi.employeeId}`
  );
}

export async function deleteKpi(id: string) {
  const kpi = await prisma.kpi.delete({
    where: { id },
    include: { employee: true },
  });

  // Re-order remaining KPIs
  const remaining = await prisma.kpi.findMany({
    where: { employeeId: kpi.employeeId },
    orderBy: { order: "asc" },
  });

  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i].order !== i + 1) {
      await prisma.kpi.update({
        where: { id: remaining[i].id },
        data: { order: i + 1 },
      });
    }
  }

  revalidatePath(
    `/companies/${kpi.employee.companyId}/employees/${kpi.employeeId}`
  );
}
