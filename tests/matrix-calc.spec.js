import { test, expect } from "@playwright/test";

test("matrix-calc loads with controls", async ({ page }) => {
  await page.goto("/#/tools/matrix-calc");
  await expect(page.locator("h1")).toContainText("Matrix Calculator");
  await expect(page.locator("#mc-a-rows")).toBeVisible();
  await expect(page.locator("#mc-op-add")).toBeVisible();
  await expect(page.locator("#mc-copy")).toBeVisible();
});

test("matrix-calc adds two matrices", async ({ page }) => {
  await page.goto("/#/tools/matrix-calc");
  const aInputs = page.locator("#mc-a-grid input");
  const bInputs = page.locator("#mc-b-grid input");
  const aVals = ["1", "2", "3", "4"];
  const bVals = ["5", "6", "7", "8"];
  for (let i = 0; i < 4; i++) {
    await aInputs.nth(i).fill(aVals[i]);
    await bInputs.nth(i).fill(bVals[i]);
  }
  await page.click("#mc-op-add");
  await expect(page.locator(".mc-cell-outline")).toHaveCount(4);
  await expect(page.locator(".mc-cell-outline").nth(0)).toHaveText("6");
  await expect(page.locator(".mc-cell-outline").nth(1)).toHaveText("8");
  await expect(page.locator(".mc-cell-outline").nth(2)).toHaveText("10");
  await expect(page.locator(".mc-cell-outline").nth(3)).toHaveText("12");
  await expect(page.locator("#mc-copy")).toBeEnabled();
});

test("matrix-calc computes a determinant as a scalar", async ({ page }) => {
  await page.goto("/#/tools/matrix-calc");
  const aInputs = page.locator("#mc-a-grid input");
  await aInputs.nth(0).fill("1");
  await aInputs.nth(1).fill("2");
  await aInputs.nth(2).fill("3");
  await aInputs.nth(3).fill("4");
  await page.click("#mc-op-det");
  await expect(page.locator(".mc-scalar")).toBeVisible();
  await expect(page.locator(".mc-scalar")).toHaveText("-2");
});

test("matrix-calc shows an error for a singular inverse", async ({ page }) => {
  await page.goto("/#/tools/matrix-calc");
  const aInputs = page.locator("#mc-a-grid input");
  await aInputs.nth(0).fill("1");
  await aInputs.nth(1).fill("2");
  await aInputs.nth(2).fill("2");
  await aInputs.nth(3).fill("4");
  await page.click("#mc-op-inv");
  await expect(page.locator(".mc-error")).toBeVisible();
  await expect(page.locator("#mc-copy")).toBeDisabled();
});
