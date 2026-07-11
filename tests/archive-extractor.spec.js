import { test, expect } from "@playwright/test";

test("archive-extractor loads", async ({ page }) => {
  await page.goto("/#/tools/archive-extractor");
  await expect(page.locator("h1")).toContainText("Archive Extractor");
  await expect(page.locator("#dropZone")).toBeVisible();
});
