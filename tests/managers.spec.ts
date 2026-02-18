import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;

test.describe("Managers CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    // Create a test company directly in DB
    const company = await prisma.company.create({
      data: { name: "Test Company" },
    });
    companyId = company.id;

    // Login
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");

    // Navigate to company detail
    await page.getByText("Test Company").click();
    await page.waitForURL(`**/companies/${companyId}`);
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("company detail loads with empty Organization section", async ({
    page,
  }) => {
    await expect(page.getByText("Test Company")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add manager/i })
    ).toBeVisible();
  });

  test("add manager shows card with initials and 0 reports", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add manager/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/name/i).fill("Ahmed Hassan");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Ahmed Hassan")).toBeVisible();
    await expect(page.getByText("AH", { exact: true })).toBeVisible();
    await expect(page.getByText(/0 reports/i)).toBeVisible();
  });

  test("edit manager name updates card", async ({ page }) => {
    // Create manager
    await page.getByRole("button", { name: /add manager/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("Ahmed Hassan");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();

    // Edit manager
    await page.getByRole("button", { name: /more/i }).click();
    await page.getByRole("menuitem", { name: /edit/i }).click();

    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel(/name/i).clear();
    await editDialog.getByLabel(/name/i).fill("Ahmed Ali");
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText("Ahmed Ali")).toBeVisible();
    await expect(page.getByText("AA", { exact: true })).toBeVisible();
  });

  test("delete manager removes card", async ({ page }) => {
    // Create manager
    await page.getByRole("button", { name: /add manager/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("To Delete");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();

    // Delete manager
    await page.getByRole("button", { name: /more/i }).click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /delete/i }).click();
    await expect(confirmDialog).not.toBeVisible();

    await expect(page.getByText("To Delete")).not.toBeVisible();
  });

  test("multiple managers all visible", async ({ page }) => {
    const managers = ["Ahmed Hassan", "Sara Mohamed", "Omar Ali"];

    for (const name of managers) {
      await page.getByRole("button", { name: /add manager/i }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByLabel(/name/i).fill(name);
      await dialog.getByRole("button", { name: /create|save|add/i }).click();
      await expect(dialog).not.toBeVisible();
    }

    for (const name of managers) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });
});
