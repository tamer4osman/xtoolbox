import { test, expect } from "@playwright/test";

test("salary-calc loads and compares countries", async ({ page }) => {
  await page.goto("/#/tools/salary-calc");
  await expect(page.locator("#tool-container h1")).toContainText("Multi-Country Salary Calculator");

  await expect(page.locator(".sc-row")).toHaveCount(12);
  const firstPct = page.locator(".sc-pct").first();
  const firstText = (await firstPct.textContent()).trim();
  expect(Number(firstText.replace("%", ""))).toBeGreaterThanOrEqual(90);

  await page.locator("#sc-gross").fill("120000");
  await expect(page.locator(".sc-pct").first()).not.toHaveText(firstText);

  await page.locator(".sc-row summary").first().click();
  await expect(page.locator(".sc-detail").first()).toContainText("Income tax");

  await page.locator("#sc-period").selectOption("12");
  await expect(page.locator(".sc-detail").first()).toContainText("Gross/yr");
});
