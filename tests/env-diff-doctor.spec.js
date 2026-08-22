import { expect, test } from "@playwright/test";

test("env-diff-doctor renders and analyzes sample data", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/env-diff-doctor");
  await expect(page.locator(".tool-header h1")).toHaveText("Env Diff & Doctor");

  await page.click("#edd-sample");
  await expect(page.locator(".edd-chip").first()).toBeVisible();
  const chips = await page.locator(".edd-chip").allTextContents();
  expect(chips.join(" ")).toMatch(/Missing: \d+/);

  await page.click("#edd-copy");

  await page.uncheck("#edd-mask");
  await expect(page.locator("#edd-results")).toContainText("api.staging.example.com");

  await page.check("#edd-mask");
  await expect(page.locator("#edd-results")).not.toContainText("api.staging.example.com");

  await page.click("#edd-swap");
  await expect(page.locator("#edd-ref")).toContainText("BROKEN LINE");
});
