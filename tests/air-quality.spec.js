import { test, expect } from "@playwright/test";

test("Air Quality Index tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/air-quality");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Air Quality Index");

  const cityInput = await page.locator("#city-input");
  await expect(cityInput).toBeAttached();

  const searchBtn = await page.locator("#search-btn");
  await expect(searchBtn).toBeAttached();

  const loading = await page.locator("#loading");
  await expect(loading).toBeAttached();

  const result = await page.locator("#result");
  await expect(result).toBeAttached();

  const aqiCircle = await page.locator("#aqi-circle");
  await expect(aqiCircle).toBeAttached();

  const aqiValue = await page.locator("#aqi-value");
  await expect(aqiValue).toBeAttached();

  const error = await page.locator("#error");
  await expect(error).toBeAttached();

  console.log("✅ Air Quality Index tool loads correctly");
});
