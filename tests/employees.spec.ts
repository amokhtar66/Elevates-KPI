import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;
let managerId: string;

test.describe("Employees CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Test Company" },
    });
    companyId = company.id;
    const manager = await prisma.manager.create({
      data: { name: "Test Manager", companyId },
    });
    managerId = manager.id;

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");
    await page.getByText("Test Company").click();
    await page.waitForURL(`**/companies/${companyId}`);
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("add employee under manager shows row with 0 KPIs badge", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add employee/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/name/i).fill("John Doe");
    await dialog.getByLabel(/role/i).fill("Software Engineer");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();

    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Software Engineer")).toBeVisible();
    await expect(page.getByText(/0 KPIs/i)).toBeVisible();
  });

  test("edit employee updates row", async ({ page }) => {
    // Create employee
    await page.getByRole("button", { name: /add employee/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("John Doe");
    await dialog.getByLabel(/role/i).fill("Software Engineer");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();

    // The employee row's "More" button is a sibling of the link containing "John Doe"
    // Use the link as anchor and find the sibling More button in the same row
    const employeeLink = page.getByRole("link", { name: /John Doe/i });
    const employeeRow = employeeLink.locator("..");
    await employeeRow.getByRole("button", { name: /more/i }).click();
    await page.getByRole("menuitem", { name: /edit/i }).click();

    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    await editDialog.getByLabel(/name/i).clear();
    await editDialog.getByLabel(/name/i).fill("Jane Doe");
    await editDialog.getByLabel(/role/i).clear();
    await editDialog.getByLabel(/role/i).fill("Senior Engineer");
    await editDialog.getByRole("button", { name: /save/i }).click();

    await expect(editDialog).not.toBeVisible();
    await expect(page.getByText("Jane Doe")).toBeVisible();
    await expect(page.getByText("Senior Engineer")).toBeVisible();
  });

  test("delete employee removes row and decrements manager count", async ({
    page,
  }) => {
    // Create employee
    await page.getByRole("button", { name: /add employee/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("To Remove");
    await dialog.getByLabel(/role/i).fill("Analyst");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByText("1 report")).toBeVisible();

    // Delete employee
    const employeeLink = page.getByRole("link", { name: /To Remove/i });
    const employeeRow = employeeLink.locator("..");
    await employeeRow.getByRole("button", { name: /more/i }).click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: /delete/i }).click();
    await expect(confirmDialog).not.toBeVisible();

    await expect(page.getByText("To Remove")).not.toBeVisible();
    await expect(page.getByText("0 reports")).toBeVisible();
  });

  test("click employee navigates to employee detail page", async ({
    page,
  }) => {
    // Create employee
    await page.getByRole("button", { name: /add employee/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("John Doe");
    await dialog.getByLabel(/role/i).fill("Designer");
    await dialog.getByRole("button", { name: /create|save|add/i }).click();
    await expect(dialog).not.toBeVisible();

    // Click employee link
    await page.getByRole("link", { name: /John Doe/i }).click();
    await expect(page).toHaveURL(/\/employees\//);
    await expect(page.getByRole("heading", { name: "John Doe" })).toBeVisible();
    await expect(page.getByText("Designer").first()).toBeVisible();
  });
});
