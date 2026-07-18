import { test, expect } from "@playwright/test";

test("video-rotate loads and displays rotation options", async ({ page }) => {
  await page.goto("/#/tools/video-rotate");
  await expect(page.locator("h1")).toContainText("Video Rotator");
  await expect(page.locator('[data-rotate="cw90"]')).toBeVisible();
  await expect(page.locator('[data-rotate="180"]')).toBeVisible();
  await expect(page.locator('[data-rotate="ccw90"]')).toBeVisible();
  await expect(page.locator('[data-rotate="hflip"]')).toBeVisible();
  await expect(page.locator('[data-rotate="vflip"]')).toBeVisible();
});
