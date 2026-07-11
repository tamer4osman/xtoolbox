import { test, expect } from "@playwright/test";

test("Video Cropper tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/video-crop");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Video Cropper");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Crop video");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  const actionBtn = await page.locator("#action-btn");
  await expect(actionBtn).toBeAttached();
  await expect(actionBtn).toHaveText("Crop Video");

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  const presets = await page.locator("#aspect-presets .aspect-btn");
  await expect(presets).toHaveCount(5);

  const freeBtn = await page.locator('.aspect-btn[data-ratio="free"]');
  await expect(freeBtn).toHaveClass(/active/);

  const cropX = await page.locator("#crop-x");
  await expect(cropX).toBeAttached();

  const cropY = await page.locator("#crop-y");
  await expect(cropY).toBeAttached();

  const cropW = await page.locator("#crop-w");
  await expect(cropW).toBeAttached();

  const cropH = await page.locator("#crop-h");
  await expect(cropH).toBeAttached();

  console.log("✅ Video Cropper tool loads correctly");
});
