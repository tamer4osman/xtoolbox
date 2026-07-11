import { test, expect } from "@playwright/test";

test("Net Worth Tracker loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/net-worth-tracker");
  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Net Worth");

  const entryType = page.locator("#entry-type");
  await expect(entryType).toBeVisible();

  const entryName = page.locator("#entry-name");
  await expect(entryName).toBeVisible();

  const entryAmount = page.locator("#entry-amount");
  await expect(entryAmount).toBeVisible();

  const addEntryBtn = page.locator("#add-entry-btn");
  await expect(addEntryBtn).toBeVisible();
  await expect(addEntryBtn).toHaveText("Add Entry");

  const exportBtn = page.locator("#export-btn");
  await expect(exportBtn).toBeVisible();

  const importBtn = page.locator("#import-btn");
  await expect(importBtn).toBeVisible();

  console.log("✅ Net Worth Tracker tool loads correctly");
});
