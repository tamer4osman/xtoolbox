import { test, expect } from "@playwright/test";

test("Color Converter tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/color-converter");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Color Format Converter");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("HEX, RGB");

  const input = await page.locator("#cc-input");
  await expect(input).toBeAttached();

  const convertBtn = await page.locator("#cc-convert");
  await expect(convertBtn).toBeAttached();

  const results = await page.locator("#cc-results");
  await expect(results).toBeAttached();

  console.log("✅ Color Converter tool loads correctly");
});
