import { test, expect } from "@playwright/test";

test("Video Silence Remover tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/silence-remover");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Video Silence Remover");

  const uploadArea = await page.locator("#upload-area");
  await expect(uploadArea).toBeAttached();

  const optionsArea = await page.locator("#options-area");
  await expect(optionsArea).toBeAttached();

  const noiseThreshold = await page.locator("#noise-threshold");
  await expect(noiseThreshold).toBeAttached();

  const minSilence = await page.locator("#min-silence");
  await expect(minSilence).toBeAttached();

  const actionBtn = await page.locator("#action-btn");
  await expect(actionBtn).toBeAttached();

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ Video Silence Remover tool loads correctly");
});
