import { test, expect } from "@playwright/test";

test("database-schema-designer loads", async ({ page }) => {
  await page.goto("/#/tools/database-schema-designer");
  await expect(page.locator("h1")).toContainText("Database Schema Designer");
});
