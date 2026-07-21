import { test, expect } from "@playwright/test";

test("video-reverse loads and has controls", async ({ page }) => {
  await page.goto("/#/tools/video-reverse");
  await expect(page.locator("h1")).toContainText("Video Reverser");
  await expect(page.locator("#mode-buttons")).toBeVisible();
  await expect(page.locator("[data-mode='both']")).toBeVisible();
  await expect(page.locator("[data-mode='video']")).toBeVisible();
  await expect(page.locator("[data-mode='audio']")).toBeVisible();
  await expect(page.locator("[data-mode='boomerang']")).toBeVisible();
});