import { test, expect } from "@playwright/test";

test("js-playground loads and has editor + console", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await expect(page.locator("h1")).toContainText("JavaScript Playground");
  await expect(page.locator("#jp-run")).toBeVisible();
  await expect(page.locator("#jp-editor")).toBeVisible();
  await expect(page.locator("#jp-console-output")).toBeVisible();
});

test("js-playground run button executes code", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await page.waitForTimeout(3000);
  await page.click("#jp-run");
  await page.waitForTimeout(1000);
  const output = await page.locator("#jp-console-output").textContent();
  expect(output).toContain("Hello, JavaScript Playground!");
});

test("js-playground clear button clears console", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await page.waitForTimeout(3000);
  await page.click("#jp-run");
  await page.waitForTimeout(1000);
  await page.click("#jp-clear");
  const output = await page.locator("#jp-console-output").textContent();
  expect(output).toBe("");
});

test("js-playground reset button restores sample code", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await page.waitForTimeout(3000);
  await page.click("#jp-reset");
  await page.waitForTimeout(500);
  await page.click("#jp-run");
  await page.waitForTimeout(1000);
  const output = await page.locator("#jp-console-output").textContent();
  expect(output).toContain("Hello, JavaScript Playground!");
});
