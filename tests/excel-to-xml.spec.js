import { test, expect } from "@playwright/test";

test("Excel to XML tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/excel-to-xml");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Excel to XML");

  const desc = await page.locator(".tool-description").textContent();
  expect(desc).toContain("Convert Excel spreadsheets");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  const convertBtn = await page.locator("#convert-btn");
  await expect(convertBtn).toBeAttached();
  await expect(convertBtn).toHaveText("Convert to XML");

  const processing = await page.locator("#processing");
  await expect(processing).toBeAttached();

  console.log("✅ Excel to XML tool loads correctly");
});
