import { test, expect } from "@playwright/test";

test("video-volume loads and has controls", async ({ page }) => {
  await page.goto("/#/tools/video-volume");
  await expect(page.locator("h1")).toContainText("Video Volume Adjuster");
  await expect(page.locator("#volume-slider")).toBeVisible();
  await expect(page.locator("#preset-buttons")).toBeVisible();
  await expect(page.locator("#reset-btn")).toBeVisible();
  await expect(page.locator("#volume-display")).toContainText("100%");
});