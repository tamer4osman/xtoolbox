import { test, expect } from "@playwright/test";

test("Working Days Calculator loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/working-days-calculator");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Working Days");

  const startDate = page.locator("#start-date");
  await expect(startDate).toBeVisible();

  const endDate = page.locator("#end-date");
  await expect(endDate).toBeVisible();

  const countrySelect = page.locator("#country-select");
  await expect(countrySelect).toBeVisible();

  const calculateBtn = page.locator("#calculate-btn");
  await expect(calculateBtn).toBeVisible();

  const resultArea = page.locator("#result-area");
  await expect(resultArea).toBeAttached();

  console.log("✅ Working Days Calculator tool loads correctly");
});
