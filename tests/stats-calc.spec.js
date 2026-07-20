import { test, expect } from "@playwright/test";

test("stats-calc loads and computes statistics", async ({ page }) => {
  await page.goto("/#/tools/stats-calc");
  await expect(page.locator("h1")).toContainText("Statistics Calculator");

  await page.fill("#stats-calc-input", "1, 2, 3, 4, 5");
  await page.waitForTimeout(400);

  await expect(page.locator("#stats-calc-results")).not.toBeEmpty();
  await expect(page.locator(".sc-stat-primary")).toBeVisible();

  const meta = await page.locator("#stats-calc-meta").textContent();
  expect(meta).toContain("N = 5");
});

test("stats-calc generates sample data", async ({ page }) => {
  await page.goto("/#/tools/stats-calc");
  await page.click("#stats-calc-sample");
  await page.waitForTimeout(400);

  const inputValue = await page.inputValue("#stats-calc-input");
  expect(inputValue.length).toBeGreaterThan(0);

  const meta = await page.locator("#stats-calc-meta").textContent();
  expect(meta).toContain("N =");
});

test("stats-calc exports results", async ({ page }) => {
  await page.goto("/#/tools/stats-calc");
  await page.fill("#stats-calc-input", "10, 20, 30");
  await page.waitForTimeout(400);

  await expect(page.locator("#stats-calc-export")).toBeVisible();
  await expect(page.locator("#stats-calc-copy-json")).toBeVisible();
  await expect(page.locator("#stats-calc-copy-csv")).toBeVisible();
  await expect(page.locator("#stats-calc-download-txt")).toBeVisible();
});
