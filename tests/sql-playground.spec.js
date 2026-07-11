import { test, expect } from "@playwright/test";

test("sql-playground loads", async ({ page }) => {
  await page.goto("/#/tools/sql-playground");
  await expect(page.locator("h1")).toContainText("SQL Playground");
});
