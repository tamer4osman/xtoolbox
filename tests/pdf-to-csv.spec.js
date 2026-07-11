import { test, expect } from "@playwright/test";

test("PDF to CSV tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/pdf-to-csv");

  // Wait for tool to load
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  // Check title
  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("PDF to CSV");

  // Check description
  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Extract tabular data from PDF to CSV format");

  // Check upload area exists
  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  // Check convert button exists (hidden until file selected - this is correct)
  const convertBtn = await page.locator("#convert-btn");
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText("Convert to CSV");

  // Check processing area exists
  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ PDF to CSV tool loads correctly");
});

test("Timestamp Converter works", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/timestamp-converter");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  // Check title
  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Timestamp Converter");

  // Click "Now" button
  await page.click("#now-btn");

  // Check results appear
  await page.waitForSelector("#ts-results", { timeout: 3000 });
  const resultsVisible = await page.locator("#ts-results").isVisible();
  expect(resultsVisible).toBe(true);

  // Check results contain expected values
  const resultsText = await page.locator("#ts-results-content").textContent();
  expect(resultsText).toMatch(/Local|ISO|UTC|Relative/);

  console.log("✅ Timestamp Converter works correctly");
});
