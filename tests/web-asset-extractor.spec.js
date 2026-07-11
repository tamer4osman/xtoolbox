import { test, expect } from "@playwright/test";

test("Web Asset Extractor tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/web-asset-extractor");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Asset");

  const textarea = await page.locator("#wae-input");
  await expect(textarea).toBeAttached();

  const extractBtn = await page.locator("#wae-extract");
  await expect(extractBtn).toBeAttached();

  const results = await page.locator("#wae-results");
  await expect(results).toBeAttached();

  console.log("✅ Web Asset Extractor tool loads correctly");
});
