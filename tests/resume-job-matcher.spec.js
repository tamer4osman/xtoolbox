import { expect, test } from "@playwright/test";

test("resume-job-matcher analyzes sample data", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/resume-job-matcher");
  await expect(page.locator(".tool-header h1")).toHaveText("Resume Job Matcher");

  await page.click("#rjm-sample");
  await expect(page.locator(".rjm-ring")).toBeVisible();
  const score = await page.locator(".rjm-score").textContent();
  expect(score).toMatch(/^\d+%$/);

  await expect(page.locator(".rjm-chip.hit").first()).toBeVisible();
  await page.click("#rjm-report");
});
