import { test, expect } from "@playwright/test";

test("Pixelate Image tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pixelate-image");

  await page.waitForSelector(".tool-header h1", { timeout: 10000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Pixelate Image");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeAttached();

  const downloadBtn = await page.locator("#download-btn");
  await expect(downloadBtn).toBeAttached();

  const pixelRange = await page.locator("#pixel-range");
  await expect(pixelRange).toBeAttached();

  const pixelVal = await page.locator("#pixel-val");
  await expect(pixelVal).toBeAttached();

  console.log("✅ Pixelate Image tool loads correctly");
});
