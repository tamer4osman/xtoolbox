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
  await expect(page.locator(".CodeMirror")).toBeVisible();
  await page.click("#jp-run");
  await expect(page.locator("#jp-console-output")).toContainText("Hello, JavaScript Playground!");
});

test("js-playground clear button clears console", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await expect(page.locator(".CodeMirror")).toBeVisible();
  await page.click("#jp-run");
  await expect(page.locator("#jp-console-output")).toContainText("Hello, JavaScript Playground!");
  await page.click("#jp-clear");
  await expect(page.locator("#jp-console-output")).toHaveText("");
});

test("js-playground reset button restores sample code", async ({ page }) => {
  await page.goto("/#/tools/js-playground");
  await expect(page.locator(".CodeMirror")).toBeVisible();
  const editor = page.locator(".CodeMirror");
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.type('console.log("modified")');
  await page.click("#jp-reset");
  await page.click("#jp-run");
  await expect(page.locator("#jp-console-output")).toContainText("Hello, JavaScript Playground!");
});
