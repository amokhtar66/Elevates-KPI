import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;

test.describe("Rounds + Evaluation Generation", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    // Create company with 1 manager and 3 employees
    const company = await prisma.company.create({
      data: { name: "Round Test Co" },
    });
    companyId = company.id;
    const manager = await prisma.manager.create({
      data: { name: "Manager One", companyId },
    });

    for (const name of ["Alice", "Bob", "Charlie"]) {
      const emp = await prisma.employee.create({
        data: { name, role: "Staff", companyId, managerId: manager.id },
      });
      await prisma.kpi.create({
        data: {
          name: `${name} KPI`,
          formQuestion: `Rate ${name}`,
          employeeId: emp.id,
          order: 1,
        },
      });
    }

    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");
    await page.getByText("Round Test Co").click();
    await page.waitForURL(`**/companies/${companyId}`);
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("start Round 1 shows In Progress with 0/3 submitted", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /new round/i }).click();

    await expect(page.getByText("Round 1")).toBeVisible();
    await expect(page.getByText(/in progress/i)).toBeVisible();
    await expect(page.getByText(/0.*3/)).toBeVisible(); // 0/3 or 0 of 3
  });

  test("round detail shows 3 evaluations with Pending status", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /new round/i }).click();
    await page.getByText("Round 1").click();

    await expect(page.getByText("Alice")).toBeVisible();
    await expect(page.getByText("Bob")).toBeVisible();
    await expect(page.getByText("Charlie")).toBeVisible();
    // All should be Pending
    const pendingBadges = page.getByText("Pending");
    await expect(pendingBadges).toHaveCount(3);
  });

  test("manager form links are copyable", async ({ page }) => {
    await page.getByRole("button", { name: /new round/i }).click();
    await page.getByText("Round 1").click();

    // Should have copy link buttons
    const copyButtons = page.getByRole("button", { name: /copy.*link/i });
    await expect(copyButtons.first()).toBeVisible();
  });

  test("start Round 2 completes Round 1", async ({ page }) => {
    // Start Round 1
    await page.getByRole("button", { name: /new round/i }).click();
    await expect(page.getByText("Round 1")).toBeVisible();

    // Start Round 2
    await page.getByRole("button", { name: /new round/i }).click();
    await expect(page.getByText("Round 2")).toBeVisible();

    // Round 1 should be Completed
    await expect(page.getByText(/completed/i)).toBeVisible();
  });

  test("add new employee while round active shows in evaluations", async ({
    page,
  }) => {
    // Start Round 1
    await page.getByRole("button", { name: /new round/i }).click();

    // Add new employee
    await page.getByRole("button", { name: /add employee/i }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name/i).fill("Diana");
    await dialog.getByLabel(/role/i).fill("Staff");
    await dialog.getByRole("button", { name: /create/i }).click();
    await expect(dialog).not.toBeVisible();

    // Go to round detail
    await page.getByText("Round 1").click();

    // Should now have 4 evaluations
    await expect(page.getByText("Diana")).toBeVisible();
    await expect(page.getByText("Alice")).toBeVisible();
  });
});
