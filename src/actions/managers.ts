"use server";

import { prisma } from "@/lib/prisma";
import { managerSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getManagers(companyId: string) {
  return prisma.manager.findMany({
    where: { companyId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          employees: { where: { deletedAt: null } },
        },
      },
    },
  });
}

export async function createManager(formData: FormData) {
  const parsed = managerSchema.safeParse({
    name: formData.get("name"),
    companyId: formData.get("companyId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.manager.create({
    data: {
      name: parsed.data.name,
      companyId: parsed.data.companyId,
    },
  });

  revalidatePath(`/companies/${parsed.data.companyId}`);
}

export async function updateManager(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const companyId = formData.get("companyId") as string;

  if (!name?.trim()) {
    return { error: "Manager name is required" };
  }

  await prisma.manager.update({
    where: { id },
    data: { name },
  });

  revalidatePath(`/companies/${companyId}`);
}

export async function deleteManager(id: string, companyId: string) {
  await prisma.manager.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/companies/${companyId}`);
}
