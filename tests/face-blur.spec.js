import { test, expect } from "@playwright/test";

test("Face Blur loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/face-blur");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Face");

  const uploadArea = page.locator("#upload-area");
  await expect(uploadArea).toBeVisible();

  const methodSelect = page.locator("#method-select");
  await expect(methodSelect).toBeAttached();

  const intensityRange = page.locator("#intensity-range");
  await expect(intensityRange).toBeAttached();

  const processBtn = page.locator("#process-btn");
  await expect(processBtn).toBeAttached();

  console.log("✅ Face Blur tool loads correctly");
});
