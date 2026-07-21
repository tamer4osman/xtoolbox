import { test, expect } from "@playwright/test";

test("savings-calc loads and calculates", async ({ page }) => {
  await page.goto("/#/tools/savings-calc");
  await expect(page.locator("h1")).toContainText("Savings Calculator");

  const calculateBtn = page.locator("button").filter({ hasText: /calculate/i });
  await expect(calculateBtn).toBeVisible();

  await calculateBtn.click();

  const result = page.locator(".result-card, .cf-result");
  await expect(result).toBeVisible();
});
