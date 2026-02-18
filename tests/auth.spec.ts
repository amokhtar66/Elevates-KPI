import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders with email, password fields and sign-in button", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("successful login redirects to /companies and shows navbar", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/companies");
    await expect(page).toHaveURL(/\/companies/);

    // Navbar should show branding and user info
    await expect(page.getByText("KPI Hub")).toBeVisible();
    await expect(page.getByText("HR Admin")).toBeVisible();
  });

  test("wrong password shows error and stays on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated access to /companies redirects to /login", async ({
    page,
  }) => {
    await page.goto("/companies");
    await expect(page).toHaveURL(/\/login/);
  });

  test("sign out returns to /login and /companies is no longer accessible", async ({
    page,
  }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@elevates.com");
    await page.getByLabel(/password/i).fill("admin123");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/companies");

    // Sign out
    await page.getByRole("button", { name: /sign out|logout|log out/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Verify /companies is no longer accessible
    await page.goto("/companies");
    await expect(page).toHaveURL(/\/login/);
  });
});
