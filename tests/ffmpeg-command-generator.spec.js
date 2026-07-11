import { test, expect } from "@playwright/test";

test("ffmpeg-command-generator loads", async ({ page }) => {
  await page.goto("/#/tools/ffmpeg-command-generator");
  await expect(page.locator("h1")).toContainText("FFmpeg Command Generator");
});
