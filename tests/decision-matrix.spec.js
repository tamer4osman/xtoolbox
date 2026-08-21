import { test, expect } from "@playwright/test";

test("decision-matrix loads and ranks live", async ({ page }) => {
  await page.goto("/#/tools/decision-matrix");
  await expect(page.locator("#tool-container h1")).toContainText("Decision Matrix Maker");

  const scoreInputs = page.locator('input[data-kind="opt-score"]');
  await expect(scoreInputs).toHaveCount(4);

  await scoreInputs.first().fill("5");
  const pct = page.locator(".dm-pct").first();
  await expect(pct).toContainText("/");
});

test("decision-matrix add, delete and reset", async ({ page }) => {
  await page.goto("/#/tools/decision-matrix");

  await page.locator("#dm-add-option").click();
  await expect(page.locator('input[data-kind="opt-name"]')).toHaveCount(3);

  await page.locator("#dm-add-criterion").click();
  await expect(page.locator('input[data-kind="crit-name"]')).toHaveCount(3);

  await page.locator("[data-del-opt]").last().click();
  await expect(page.locator('input[data-kind="opt-name"]')).toHaveCount(2);

  await page.locator("#dm-reset").click();
  await expect(page.locator('input[data-kind="crit-name"]')).toHaveCount(2);
  await expect(page.locator('input[data-kind="crit-name"]').first()).toHaveValue("Cost");
});
