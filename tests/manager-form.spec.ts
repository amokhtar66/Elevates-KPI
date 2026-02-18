import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let managerFormToken: string;
let evaluationId: string;

test.describe("Manager Evaluation Form", () => {
  test.beforeEach(async () => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Form Test Co" },
    });
    const manager = await prisma.manager.create({
      data: { name: "Manager One", companyId: company.id },
    });
    const employee = await prisma.employee.create({
      data: {
        name: "John Doe",
        role: "Engineer",
        companyId: company.id,
        managerId: manager.id,
      },
    });

    await prisma.kpi.createMany({
      data: [
        {
          name: "Communication",
          formQuestion: "Rate communication skills",
          employeeId: employee.id,
          order: 1,
        },
        {
          name: "Teamwork",
          formQuestion: "Rate teamwork abilities",
          employeeId: employee.id,
          order: 2,
        },
      ],
    });

    const round = await prisma.evaluationRound.create({
      data: { companyId: company.id, roundNumber: 1 },
    });
    const evaluation = await prisma.evaluation.create({
      data: {
        roundId: round.id,
        employeeId: employee.id,
        managerId: manager.id,
      },
    });
    evaluationId = evaluation.id;
    managerFormToken = evaluation.managerFormToken;
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("form renders with employee info and all KPI questions", async ({
    page,
  }) => {
    await page.goto(`/evaluate/${managerFormToken}`);
    await expect(page.getByText("John Doe")).toBeVisible();
    await expect(page.getByText("Engineer")).toBeVisible();
    await expect(page.getByText("Rate communication skills")).toBeVisible();
    await expect(page.getByText("Rate teamwork abilities")).toBeVisible();
    await expect(
      page.getByText("Recommendations and Next Steps")
    ).toBeVisible();
  });

  test("submit without rating all KPIs shows validation error", async ({
    page,
  }) => {
    await page.goto(`/evaluate/${managerFormToken}`);
    await page.getByLabel(/recommendations/i).fill("Good work");
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(
      page.getByText("Please provide a rating for all KPIs")
    ).toBeVisible();
  });

  test("submit without recommendations shows validation error", async ({
    page,
  }) => {
    await page.goto(`/evaluate/${managerFormToken}`);
    // Rate both KPIs
    const kpiSections = page.locator("[data-kpi-id]");
    const kpiCount = await kpiSections.count();
    for (let i = 0; i < kpiCount; i++) {
      const section = kpiSections.nth(i);
      await section.locator("[data-rating='4']").click();
    }
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(
      page.getByText("Recommendations and Next Steps is required")
    ).toBeVisible();
  });

  test("complete form properly shows thank you", async ({ page }) => {
    await page.goto(`/evaluate/${managerFormToken}`);

    // Rate each KPI
    const kpiSections = page.locator("[data-kpi-id]");
    const kpiCount = await kpiSections.count();
    for (let i = 0; i < kpiCount; i++) {
      const section = kpiSections.nth(i);
      await section.locator("[data-rating='4']").click();
    }

    await page.getByLabel(/recommendations/i).fill("Excellent progress overall.");
    await page.getByRole("button", { name: /submit/i }).click();

    await expect(
      page.getByRole("heading", { name: "Thank You!" })
    ).toBeVisible();
  });

  test("revisit submitted form shows already submitted", async ({ page }) => {
    // Submit first
    await page.goto(`/evaluate/${managerFormToken}`);
    const kpiSections = page.locator("[data-kpi-id]");
    const kpiCount = await kpiSections.count();
    for (let i = 0; i < kpiCount; i++) {
      await kpiSections.nth(i).locator("[data-rating='4']").click();
    }
    await page.getByLabel(/recommendations/i).fill("Good work");
    await page.getByRole("button", { name: /submit/i }).click();
    await expect(
      page.getByRole("heading", { name: "Thank You!" })
    ).toBeVisible();

    // Revisit
    await page.goto(`/evaluate/${managerFormToken}`);
    await expect(
      page.getByRole("heading", { name: "Already Submitted" })
    ).toBeVisible();
  });

  test("invalid token shows not found page", async ({ page }) => {
    const response = await page.goto("/evaluate/invalid-token-12345");
    expect(response?.status()).toBe(404);
  });
});
