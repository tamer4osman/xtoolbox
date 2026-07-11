import { test, expect } from "@playwright/test";

test("font-subsetter loads", async ({ page }) => {
  await page.goto("/#/tools/font-subsetter");
  await expect(page.locator("h1")).toContainText("Font Subsetter");
});
