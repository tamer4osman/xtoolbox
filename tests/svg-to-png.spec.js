import { test, expect } from "@playwright/test";

test("SVG to PNG Converter tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/svg-to-png");

  // Wait for tool to load
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  // Check title
  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("SVG to PNG");

  // Check description
  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Convert SVG images to PNG with size and background control");

  // Check upload area exists
  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  // Check convert button exists (hidden until file selected)
  const convertBtn = await page.locator("#convert-btn");
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText("Convert to PNG");

  // Check processing area exists
  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ SVG to PNG Converter tool loads correctly");
});
