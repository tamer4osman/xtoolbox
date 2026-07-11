import { test, expect } from "@playwright/test";

test("Image Sharpening tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/image-sharpening");

  await page.waitForSelector(".tool-header h1", { timeout: 10000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Image Sharpening");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeAttached();

  const downloadBtn = await page.locator("#download-btn");
  await expect(downloadBtn).toBeAttached();

  const intensityRange = await page.locator("#intensity-range");
  await expect(intensityRange).toBeAttached();

  const intensityVal = await page.locator("#intensity-val");
  await expect(intensityVal).toBeAttached();

  const compareBtn = await page.locator("#compare-btn");
  await expect(compareBtn).toBeAttached();

  console.log("✅ Image Sharpening tool loads correctly");
});
