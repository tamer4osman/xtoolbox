import { test, expect } from "@playwright/test";

test("audio-pitch loads and displays UI", async ({ page }) => {
  await page.goto("/#/tools/audio-pitch");
  await expect(page.locator("h1")).toContainText("Pitch Shifter");
  await expect(page.locator(".tool-upload-area")).toBeVisible();
});