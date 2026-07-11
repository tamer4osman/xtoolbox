import { test, expect } from "@playwright/test";

test("Page Textbook Splitter tool loads and has correct UI", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/textbook-splitter");

  await page.waitForSelector(".tool-layout", { timeout: 5000 });

  const title = await page.locator(".tool-header h1").textContent();
  expect(title).toContain("Page Textbook Splitter");

  const uploadArea = await page.locator(".tool-upload-area");
  await expect(uploadArea).toBeVisible();

  const splitBtn = await page.locator("#split-btn");
  await expect(splitBtn).toBeAttached();
  await expect(splitBtn).toHaveText("Split & Download ZIP");

  console.log("✅ Page Textbook Splitter tool loads correctly");
});
