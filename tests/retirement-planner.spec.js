import { test, expect } from "@playwright/test";

test("retirement-planner loads and updates live", async ({ page }) => {
  await page.goto("/#/tools/retirement-planner");
  await expect(page.locator("#tool-container h1")).toContainText("Retirement Planner");

  await expect(page.locator("#rp-verdict")).toBeVisible();
  await expect(page.locator(".rp-stat").first()).toContainText("Nest egg");

  const verdictBefore = await page.locator("#rp-verdict").textContent();

  await page.locator("#rp-income").fill("1000000");
  const verdictAfter = await page.locator("#rp-verdict").textContent();
  expect(verdictAfter).not.toBe(verdictBefore);
  await expect(page.locator("#rp-verdict")).toContainText("Runs out");

  await page.locator("#rp-income").fill("20000");
  await expect(page.locator("#rp-verdict")).toContainText("Sustainable");
});
