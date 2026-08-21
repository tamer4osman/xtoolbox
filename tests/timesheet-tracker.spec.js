import { test, expect } from "@playwright/test";

test("timesheet-tracker loads and clocks in/out", async ({ page }) => {
  await page.goto("/#/tools/timesheet-tracker");
  await expect(page.locator("#tool-container h1")).toContainText("Timesheet Tracker");

  const toggle = page.locator("#ts-toggle");
  await expect(toggle).toHaveText("▶ Clock In");
  await expect(page.locator("#ts-status")).toContainText("Not clocked in");

  await toggle.click();
  await expect(toggle).toHaveText("⏹ Clock Out");
  await expect(page.locator("#ts-status")).toContainText("Clocked in at");

  await page.waitForTimeout(1100);
  await expect(page.locator("#ts-status")).not.toContainText("Clocked in at — ");

  await toggle.click();
  await expect(toggle).toHaveText("▶ Clock In");
});

test("timesheet-tracker persists entries and exports CSV", async ({ page }) => {
  await page.goto("/#/tools/timesheet-tracker");
  await page.locator("#ts-toggle").click();
  await page.locator("#ts-toggle").click();
  await expect(page.locator(".ts-entry")).toHaveCount(1);

  const download = page.waitForEvent("download");
  await page.locator("#ts-export").click();
  expect((await download).suggestedFilename()).toMatch(/^timesheet-\d{4}-W\d{2}\.csv$/);

  await page.locator("#ts-clear").click();
  await expect(page.locator(".ts-empty")).toBeVisible();
});
