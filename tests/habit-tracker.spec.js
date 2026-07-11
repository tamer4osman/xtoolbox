import { test, expect } from "@playwright/test";

test("habit-tracker loads", async ({ page }) => {
  await page.goto("/#/tools/habit-tracker");
  await expect(page.locator("h1")).toContainText("Habit Tracker");
  await expect(page.locator("#newHabit")).toBeVisible();
});
