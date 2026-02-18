import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;
let employeeId: string;

test.describe("KPIs CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Test Company" },
    });
    companyId = company.id;
    const manager = await prisma.manager.create({
      data: { name: "Test Manager", companyId },
    });
    const employee = await prisma.employee.create({
      data: {
        name: "Test Employee",
        role: "Engineer",
        companyId,
        managerId: manager.id,
      },
    });
    employeeId = employee.id;

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");
    await page.getByText("Test Company").click();
    await page.waitForURL(`**/companies/${companyId}`);
    await page.getByRole("link", { name: /Test Employee/i }).click();
    await page.waitForURL(`**/employees/${employeeId}`);
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("empty KPI state with Add KPI button", async ({ page }) => {
    await expect(page.getByText(/no kpis/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add kpi/i })
    ).toBeVisible();
  });

  test("add KPI with name and form question", async ({ page }) => {
    await page.getByRole("button", { name: /add kpi/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/name/i).fill("Campaign Performance");
    await dialog.getByLabel(/question/i).fill("How well did the campaigns perform?");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Campaign Performance")).toBeVisible();
    await expect(
      page.getByText("How well did the campaigns perform?")
    ).toBeVisible();
  });

  test("add 3 KPIs displays in order", async ({ page }) => {
    const kpis = [
      { name: "Communication", question: "Rate communication skills" },
      { name: "Teamwork", question: "How well do they collaborate?" },
      { name: "Leadership", question: "Rate leadership abilities" },
    ];

    for (const kpi of kpis) {
      await page.getByRole("button", { name: /add kpi/i }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByLabel(/name/i).fill(kpi.name);
      await dialog.getByLabel(/question/i).fill(kpi.question);
      await dialog.getByRole("button", { name: /create|save|add/i }).click();
      await expect(dialog).not.toBeVisible();
    }

    for (const kpi of kpis) {
      await expect(page.getByText(kpi.name, { exact: true })).toBeVisible();
    }
  });

  test("edit KPI name and question", async ({ page }) => {
    // Create KPI
    await page.getByRole("button", { name: /add kpi/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("Original KPI");
    await dialog.getByLabel(/question/i).fill("Original question");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();

    // Edit KPI
    await page.getByRole("button", { name: /edit/i }).first().click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel(/name/i).clear();
    await editDialog.getByLabel(/name/i).fill("Updated KPI");
    await editDialog.getByLabel(/question/i).clear();
    await editDialog.getByLabel(/question/i).fill("Updated question");
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText("Updated KPI")).toBeVisible();
    await expect(page.getByText("Updated question")).toBeVisible();
  });

  test("delete KPI removes it", async ({ page }) => {
    // Create KPI
    await page.getByRole("button", { name: /add kpi/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("To Delete KPI");
    await dialog.getByLabel(/question/i).fill("Will be deleted");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("To Delete KPI")).toBeVisible();

    // Delete KPI
    await page.getByRole("button", { name: /delete/i }).first().click();
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /delete/i }).click();
    await expect(confirmDialog).not.toBeVisible();

    await expect(page.getByText("To Delete KPI")).not.toBeVisible();
  });
});
