import { test, expect } from "@playwright/test";

test("XML to CSV Converter tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/xml-to-csv");

  await page.waitForSelector(".tool-header h1", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("XML to CSV");

  const dropzone = await page.locator("#dropzone");
  await expect(dropzone).toBeAttached();

  const fileInput = await page.locator("#file-input");
  await expect(fileInput).toBeAttached();

  const browseBtn = await page.locator("#browse-btn");
  await expect(browseBtn).toBeAttached();

  const preview = await page.locator("#preview");
  await expect(preview).toBeAttached();

  const downloadBtn = await page.locator("#download-btn");
  await expect(downloadBtn).toBeAttached();

  console.log("✅ XML to CSV Converter tool loads correctly");
});
