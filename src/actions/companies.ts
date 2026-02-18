"use server";

import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getCompanies() {
  return prisma.company.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          managers: { where: { deletedAt: null } },
          employees: { where: { deletedAt: null } },
        },
      },
    },
  });
}

export async function createCompany(formData: FormData) {
  const parsed = companySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.company.create({
    data: { name: parsed.data.name },
  });

  revalidatePath("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const parsed = companySchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.company.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/companies");
}

export async function deleteCompany(id: string) {
  await prisma.company.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/companies");
}
