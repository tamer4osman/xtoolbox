import { test, expect } from "@playwright/test";

test("Sitemap XML Visualizer tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/sitemap-visualizer");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Sitemap");

  const tabs = await page.locator(".sv-tab");
  await expect(tabs).toHaveCount(3);

  const xmlInput = await page.locator("#xmlInput");
  await expect(xmlInput).toBeAttached();

  const parseBtn = await page.locator("#parseBtn");
  await expect(parseBtn).toBeAttached();

  const results = await page.locator("#results");
  await expect(results).toBeAttached();

  console.log("✅ Sitemap XML Visualizer tool loads correctly");
});
