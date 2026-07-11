import { test, expect } from "@playwright/test";

test("SVG Optimizer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/svg-optimizer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("SVG");

  await expect(page.locator("#svg-optimize-btn")).toBeAttached();
  await expect(page.locator("#svg-results")).toBeAttached();

  console.log("✅ SVG Optimizer tool loads correctly");
});
