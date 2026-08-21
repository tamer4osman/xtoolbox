import { test, expect } from "@playwright/test";

test("name-generator loads and generates names", async ({ page }) => {
  await page.goto("/#/tools/name-generator");
  await expect(page.locator("#tool-container h1")).toContainText("Name Generator");

  const chipsBefore = await page.locator(".ng-chip").count();

  await page.locator("#ng-culture").selectOption("fantasy");
  await page.locator("#ng-gender").selectOption("female");
  await page.locator("#ng-count").fill("10");
  await page.locator("#ng-generate").click();

  await expect(page.locator(".ng-chip")).toHaveCount(10);
  expect(chipsBefore).toBe(0);

  const names = await page.locator(".ng-chip").allTextContents();
  for (const name of names) {
    expect(name.length).toBeGreaterThan(3);
    expect(name).not.toBe("Copied!");
  }

  await expect(page.locator("#ng-copy-all")).toBeVisible();
});

test("name-generator copies a name on chip click", async ({ page }) => {
  await page.goto("/#/tools/name-generator");
  await page.locator("#ng-generate").click();
  const firstChip = page.locator(".ng-chip").first();
  await firstChip.click();
  await expect(firstChip).toContainText("Copied!");
});
