import { test, expect } from "@playwright/test";
import { cleanTestData, disconnectPrisma } from "./helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let employeeViewToken: string;

test.describe("Employee Score Page", () => {
  test.beforeEach(async () => {
    await cleanTestData();
    const company = await prisma.company.create({
      data: { name: "Score Co" },
    });
    const manager = await prisma.manager.create({
      data: { name: "Mgr", companyId: company.id },
    });
    const employee = await prisma.employee.create({
      data: {
        name: "Score Employee",
        role: "Analyst",
        companyId: company.id,
        managerId: manager.id,
      },
    });

    const kpi1 = await prisma.kpi.create({
      data: { name: "Accuracy", formQuestion: "Rate accuracy", employeeId: employee.id, order: 1 },
    });
    const kpi2 = await prisma.kpi.create({
      data: { name: "Timeliness", formQuestion: "Rate timeliness", employeeId: employee.id, order: 2 },
    });
    // KPI3 will be hidden
    const kpi3 = await prisma.kpi.create({
      data: { name: "Hidden KPI", formQuestion: "Hidden question", employeeId: employee.id, order: 3 },
    });

    const round = await prisma.evaluationRound.create({
      data: { companyId: company.id, roundNumber: 1 },
    });
    const evaluation = await prisma.evaluation.create({
      data: {
        roundId: round.id,
        employeeId: employee.id,
        managerId: manager.id,
        managerSubmittedAt: new Date(),
        managerRecommendations: "Keep improving",
        snapshotKpis: [
          { id: kpi1.id, name: "Accuracy", formQuestion: "Rate accuracy", order: 1 },
          { id: kpi2.id, name: "Timeliness", formQuestion: "Rate timeliness", order: 2 },
          { id: kpi3.id, name: "Hidden KPI", formQuestion: "Hidden question", order: 3 },
        ],
      },
    });
    employeeViewToken = evaluation.employeeViewToken;

    // Create scores — kpi3 hidden from employee
    await prisma.evaluationScore.createMany({
      data: [
        { evaluationId: evaluation.id, kpiId: kpi1.id, managerScore: 4, hrAdjustedScore: 5, hrComment: "Raised", showToEmployee: true },
        { evaluationId: evaluation.id, kpiId: kpi2.id, managerScore: 3, showToEmployee: true },
        { evaluationId: evaluation.id, kpiId: kpi3.id, managerScore: 2, showToEmployee: false },
      ],
    });

    // Default: NOT published
  });

  test.afterAll(async () => {
    await cleanTestData();
    await prisma.$disconnect();
    await disconnectPrisma();
  });

  test("unpublished evaluation shows not available", async ({ page }) => {
    await page.goto(`/scores/${employeeViewToken}`);
    await expect(page.getByRole("heading", { name: "Not Available" })).toBeVisible();
  });

  test("published evaluation shows name, role, round, and overall score", async ({
    page,
  }) => {
    // Publish the evaluation
    await prisma.evaluation.updateMany({
      where: { employeeViewToken },
      data: { hrPublished: true },
    });

    await page.goto(`/scores/${employeeViewToken}`);
    await expect(page.getByText("Score Employee")).toBeVisible();
    await expect(page.getByText("Analyst")).toBeVisible();
    await expect(page.getByText(/round 1/i)).toBeVisible();
    // Overall score: visible KPIs are kpi1 (hrAdjusted=5) and kpi2 (managerScore=3) = avg 4.0
    await expect(page.getByText("4.0")).toBeVisible();
  });

  test("hidden KPI excluded from display", async ({ page }) => {
    await prisma.evaluation.updateMany({
      where: { employeeViewToken },
      data: { hrPublished: true },
    });

    await page.goto(`/scores/${employeeViewToken}`);
    await expect(page.getByRole("heading", { name: "Accuracy" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Timeliness" })).toBeVisible();
    await expect(page.getByText("Hidden KPI")).not.toBeVisible();
  });

  test("HR-adjusted score shown instead of manager score", async ({ page }) => {
    await prisma.evaluation.updateMany({
      where: { employeeViewToken },
      data: { hrPublished: true },
    });

    await page.goto(`/scores/${employeeViewToken}`);
    // Accuracy was adjusted from 4 to 5
    await expect(page.getByText("Raised")).toBeVisible(); // HR comment
  });

  test("invalid token shows error page", async ({ page }) => {
    const response = await page.goto("/scores/invalid-token-xyz");
    expect(response?.status()).toBe(404);
  });
});
