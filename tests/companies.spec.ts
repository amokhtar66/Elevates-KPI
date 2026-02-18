import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";

test.describe("Companies CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");
  });

  test.afterAll(async () => {
    await cleanTestData();
    await disconnectPrisma();
  });

  test("empty state shows Add Company card", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /add company/i })
    ).toBeVisible();
  });

  test("create company shows card with initials", async ({ page }) => {
    await page.getByRole("button", { name: /add company/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/name/i).fill("TechVision Egypt");
    await dialog.getByRole("button", { name: /create/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("TechVision Egypt")).toBeVisible();
    // Check initials (T from TechVision, E from Egypt)
    await expect(page.getByText("TE", { exact: true })).toBeVisible();
  });

  test("edit company name updates card", async ({ page }) => {
    // Create a company first
    await page.getByRole("button", { name: /add company/i }).click();
    const createDialog = page.getByRole("dialog");
    await createDialog.getByLabel(/name/i).fill("TechVision Egypt");
    await createDialog.getByRole("button", { name: /create/i }).click();
    await expect(createDialog).not.toBeVisible();

    // Click the "More" dropdown button
    await page.getByRole("button", { name: /more/i }).click();

    // Click "Edit" from the dropdown
    await page.getByRole("menuitem", { name: /edit/i }).click();

    // Edit dialog should open
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel(/name/i).clear();
    await editDialog.getByLabel(/name/i).fill("TechVision Global");
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText("TechVision Global")).toBeVisible();
    await expect(page.getByText("TG", { exact: true })).toBeVisible();
  });

  test("delete company removes it from grid", async ({ page }) => {
    // Create a company first
    await page.getByRole("button", { name: /add company/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("Delete Me Corp");
    await dialog.getByRole("button", { name: /create/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("Delete Me Corp")).toBeVisible();

    // Click the "More" dropdown
    await page.getByRole("button", { name: /more/i }).click();

    // Click "Delete" from the dropdown
    await page.getByRole("menuitem", { name: /delete/i }).click();

    // Confirm deletion in alert dialog
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /delete/i }).click();

    // Wait for alert dialog to close first
    await expect(confirmDialog).not.toBeVisible();
    // Now verify card is gone
    await expect(page.getByRole("heading", { name: "Delete Me Corp" })).not.toBeVisible();
  });

  test("create multiple companies displays all correctly", async ({ page }) => {
    const companies = ["Alpha Inc", "Beta Solutions", "Gamma Tech"];

    for (const name of companies) {
      await page.getByRole("button", { name: /add company/i }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByLabel(/name/i).fill(name);
      await dialog.getByRole("button", { name: /create/i }).click();
      await expect(dialog).not.toBeVisible();
    }

    for (const name of companies) {
      await expect(page.getByText(name)).toBeVisible();
    }
  });
});
