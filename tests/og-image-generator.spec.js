import { test, expect } from "@playwright/test";

test("og-image-generator loads and renders", async ({ page }) => {
  await page.goto("/#/tools/og-image-generator");
  await expect(page.locator("h1")).toContainText("Open Graph Image Generator");
  await expect(page.locator("#og-canvas")).toBeVisible();
  await expect(page.locator("#og-title")).toBeVisible();
  await expect(page.locator("#download-btn")).toBeVisible();
});

test("og-image-generator changes preset", async ({ page }) => {
  await page.goto("/#/tools/og-image-generator");
  await page.click(".preset-btn >> nth=1");
  await expect(page.locator("#og-canvas")).toBeVisible();
});
