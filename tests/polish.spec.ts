import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;
let roundId: string;

test.describe("Polish features", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Polish Co" },
    });
    companyId = company.id;
    const manager = await prisma.manager.create({
      data: { name: "Mgr", companyId },
    });

    for (const name of ["Emp A", "Emp B"]) {
      const emp = await prisma.employee.create({
        data: { name, role: "Staff", companyId, managerId: manager.id },
      });
      await prisma.kpi.create({
        data: { name: `${name} KPI`, formQuestion: `Rate ${name}`, employeeId: emp.id, order: 1 },
      });
    }

    const round = await prisma.evaluationRound.create({
      data: { companyId, roundNumber: 1 },
    });
    roundId = round.id;

    const employees = await prisma.employee.findMany({ where: { companyId } });
    for (const emp of employees) {
      await prisma.evaluation.create({
        data: { roundId: round.id, employeeId: emp.id, managerId: manager.id },
      });
    }

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("cancel evaluation from round detail removes it from active list", async ({
    page,
  }) => {
    await page.goto(`/companies/${companyId}/rounds/${roundId}`);
    await expect(page.getByText("Emp A")).toBeVisible();

    // Cancel Emp A's evaluation
    const empARow = page.getByRole("row").filter({ hasText: "Emp A" });
    await empARow.getByRole("button", { name: /cancel/i }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /cancel.*eval|confirm/i }).click();
    await expect(confirmDialog).not.toBeVisible();

    // Should show Cancelled status
    await expect(page.getByText("Cancelled")).toBeVisible();
  });

  test("bulk copy all manager links button present and works", async ({
    page,
  }) => {
    await page.goto(`/companies/${companyId}/rounds/${roundId}`);

    // Look for a "Copy All Links" button
    const bulkCopyBtn = page.getByRole("button", {
      name: /copy all|bulk copy/i,
    });
    await expect(bulkCopyBtn).toBeVisible();
    await bulkCopyBtn.click();

    // Verify button text changes to indicate success
    await expect(page.getByText(/copied/i)).toBeVisible();
  });

  test("complete round button marks round as completed", async ({ page }) => {
    await page.goto(`/companies/${companyId}/rounds/${roundId}`);

    const completeBtn = page.getByRole("button", {
      name: /complete.*round/i,
    });
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /complete|confirm/i }).click();
    await expect(confirmDialog).not.toBeVisible();

    await expect(page.getByText("Completed")).toBeVisible();
  });
});
