import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let companyId: string;
let roundId: string;
let evaluationId: string;
let managerFormToken: string;

test.describe("HR Review Interface", () => {
  test.beforeEach(async ({ page }) => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Review Co" },
    });
    companyId = company.id;
    const manager = await prisma.manager.create({
      data: { name: "Mgr", companyId },
    });
    const employee = await prisma.employee.create({
      data: { name: "Employee A", role: "Dev", companyId, managerId: manager.id },
    });

    const kpi1 = await prisma.kpi.create({
      data: { name: "Quality", formQuestion: "Rate quality", employeeId: employee.id, order: 1 },
    });
    const kpi2 = await prisma.kpi.create({
      data: { name: "Speed", formQuestion: "Rate speed", employeeId: employee.id, order: 2 },
    });

    const round = await prisma.evaluationRound.create({
      data: { companyId, roundNumber: 1 },
    });
    roundId = round.id;

    const evaluation = await prisma.evaluation.create({
      data: { roundId: round.id, employeeId: employee.id, managerId: manager.id },
    });
    evaluationId = evaluation.id;
    managerFormToken = evaluation.managerFormToken;

    // Submit manager evaluation
    await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: {
        managerSubmittedAt: new Date(),
        managerRecommendations: "Great employee, keep going",
        snapshotKpis: [
          { id: kpi1.id, name: "Quality", formQuestion: "Rate quality", order: 1 },
          { id: kpi2.id, name: "Speed", formQuestion: "Rate speed", order: 2 },
        ],
      },
    });
    await prisma.evaluationScore.createMany({
      data: [
        { evaluationId: evaluation.id, kpiId: kpi1.id, managerScore: 4, managerComment: "Solid quality" },
        { evaluationId: evaluation.id, kpiId: kpi2.id, managerScore: 3, managerComment: "Needs improvement" },
      ],
    });

    // Login
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

  test("submitted evaluation shows manager scores and comments", async ({
    page,
  }) => {
    await page.goto(
      `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
    );
    await expect(page.getByRole("heading", { name: "Quality" })).toBeVisible();
    await expect(page.getByText("Solid quality")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Speed" })).toBeVisible();
    await expect(page.getByText("Needs improvement")).toBeVisible();
    await expect(page.getByText("Great employee, keep going")).toBeVisible();
  });

  test("adjust score without HR comment shows validation error", async ({
    page,
  }) => {
    await page.goto(
      `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
    );

    // Change HR adjusted score for first KPI
    const firstHrScore = page.locator("[data-hr-score]").first();
    await firstHrScore.locator("[data-rating='5']").click();

    // Try to save without HR comment
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText(/comment.*required|required.*comment/i)).toBeVisible();
  });

  test("adjust score with HR comment saves successfully", async ({
    page,
  }) => {
    await page.goto(
      `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
    );

    // Change HR adjusted score
    const firstHrScore = page.locator("[data-hr-score]").first();
    await firstHrScore.locator("[data-rating='5']").click();

    // Add HR comment
    const hrComments = page.locator("[data-hr-comment]");
    await hrComments.first().fill("Adjusted based on peer feedback");

    await page.getByRole("button", { name: /save/i }).click();

    // Should save successfully — verify by checking page doesn't show error
    await expect(page.getByText(/saved|success/i)).toBeVisible();
  });

  test("publish changes status to Published in round detail", async ({
    page,
  }) => {
    await page.goto(
      `/companies/${companyId}/rounds/${roundId}/evaluations/${evaluationId}`
    );

    await page.getByRole("button", { name: /publish/i }).click();

    // Navigate to round detail to verify
    await page.goto(`/companies/${companyId}/rounds/${roundId}`);
    await expect(page.getByText("Published")).toBeVisible();
  });
});
