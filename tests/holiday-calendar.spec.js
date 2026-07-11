import { test, expect } from "@playwright/test";

test("Public Holiday Calendar tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/holiday-calendar");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Public Holiday Calendar");

  const countrySelect = await page.locator("#country-select");
  await expect(countrySelect).toBeAttached();

  const yearInput = await page.locator("#year-input");
  await expect(yearInput).toBeAttached();

  const searchBtn = await page.locator("#search-btn");
  await expect(searchBtn).toBeAttached();

  const loading = await page.locator("#loading");
  await expect(loading).toBeAttached();

  const result = await page.locator("#result");
  await expect(result).toBeAttached();

  const error = await page.locator("#error");
  await expect(error).toBeAttached();

  console.log("✅ Public Holiday Calendar tool loads correctly");
});
