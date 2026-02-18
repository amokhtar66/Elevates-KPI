"use server";

import { prisma } from "@/lib/prisma";
import { employeeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getEmployeesByManager(managerId: string) {
  return prisma.employee.findMany({
    where: { managerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { kpis: true },
      },
    },
  });
}

export async function createEmployee(formData: FormData) {
  const parsed = employeeSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    companyId: formData.get("companyId"),
    managerId: formData.get("managerId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const employee = await prisma.employee.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      companyId: parsed.data.companyId,
      managerId: parsed.data.managerId,
    },
  });

  // Auto-include in active (in_progress) round if one exists
  const activeRound = await prisma.evaluationRound.findFirst({
    where: { companyId: parsed.data.companyId, status: "in_progress" },
  });

  if (activeRound) {
    await prisma.evaluation.create({
      data: {
        roundId: activeRound.id,
        employeeId: employee.id,
        managerId: parsed.data.managerId,
      },
    });
  }

  revalidatePath(`/companies/${parsed.data.companyId}`);
}

export async function updateEmployee(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) return { error: "Employee name is required" };
  if (!role?.trim()) return { error: "Role is required" };

  await prisma.employee.update({
    where: { id },
    data: { name, role },
  });

  revalidatePath(`/companies/${companyId}`);
}

export async function deleteEmployee(
  id: string,
  companyId: string
) {
  await prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/companies/${companyId}`);
}
