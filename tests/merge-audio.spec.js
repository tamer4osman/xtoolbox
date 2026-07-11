import { test, expect } from "@playwright/test";

test("Audio Merger tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/merge-audio");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Audio Merger");

  const uploadArea = await page.locator("#upload-area");
  await expect(uploadArea).toBeAttached();

  const fileList = await page.locator("#file-list");
  await expect(fileList).toBeAttached();

  const mergeBtn = await page.locator("#merge-btn");
  await expect(mergeBtn).toBeAttached();

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ Audio Merger tool loads correctly");
});
