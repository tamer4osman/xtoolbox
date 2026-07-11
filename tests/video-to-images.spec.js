import { test, expect } from "@playwright/test";

test("Video to Images tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/video-to-images");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Video to Images");

  const uploadArea = await page.locator("#upload-area");
  await expect(uploadArea).toBeAttached();

  const optionsArea = await page.locator("#options-area");
  await expect(optionsArea).toBeAttached();

  const fpsSelect = await page.locator("#fps-select");
  await expect(fpsSelect).toBeAttached();

  const formatSelect = await page.locator("#format-select");
  await expect(formatSelect).toBeAttached();

  const actionBtn = await page.locator("#action-btn");
  await expect(actionBtn).toBeAttached();

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ Video to Images tool loads correctly");
});
