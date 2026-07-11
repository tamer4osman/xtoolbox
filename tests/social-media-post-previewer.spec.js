import { test, expect } from "@playwright/test";

test("social-media-post-previewer loads", async ({ page }) => {
  await page.goto("/#/tools/social-media-post-previewer");
  await expect(page.locator("h1")).toContainText("Social Media Post Previewer");
  await expect(page.locator("#url-input")).toBeVisible();
  await expect(page.locator("#fetch-btn")).toBeVisible();
});
