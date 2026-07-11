import { test, expect } from "@playwright/test";

test("Sunrise & Sunset Times tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sunrise-sunset");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Sunrise & Sunset");

  const locationInput = await page.locator("#location-input");
  await expect(locationInput).toBeAttached();

  const searchBtn = await page.locator("#search-btn");
  await expect(searchBtn).toBeAttached();

  const loading = await page.locator("#loading");
  await expect(loading).toBeAttached();

  const result = await page.locator("#result");
  await expect(result).toBeAttached();

  const sunrise = await page.locator("#sunrise");
  await expect(sunrise).toBeAttached();

  const sunset = await page.locator("#sunset");
  await expect(sunset).toBeAttached();

  const solarNoon = await page.locator("#solar-noon");
  await expect(solarNoon).toBeAttached();

  const dayLength = await page.locator("#day-length");
  await expect(dayLength).toBeAttached();

  const error = await page.locator("#error");
  await expect(error).toBeAttached();

  console.log("✅ Sunrise & Sunset Times tool loads correctly");
});
