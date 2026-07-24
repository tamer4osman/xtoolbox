import { test, expect } from "@playwright/test";

test("video-metadata-editor loads and has controls", async ({ page }) => {
  await page.goto("/#/tools/video-metadata-editor");
  await expect(page.locator("h1")).toContainText("Video Metadata Editor");
  await expect(page.locator("#meta-title")).toBeVisible();
  await expect(page.locator("#meta-artist")).toBeVisible();
  await expect(page.locator("#meta-album")).toBeVisible();
  await expect(page.locator("#meta-date")).toBeVisible();
  await expect(page.locator("#meta-genre")).toBeVisible();
  await expect(page.locator("#meta-comment")).toBeVisible();
  await expect(page.locator("#meta-copyright")).toBeVisible();
  await expect(page.locator("#add-pair-btn")).toBeVisible();
});

test("video-metadata-editor can add custom tag", async ({ page }) => {
  await page.goto("/#/tools/video-metadata-editor");
  await page.locator("#add-pair-btn").click();
  await expect(page.locator("input[id^='custom-key-']")).toBeVisible();
  await expect(page.locator("input[id^='custom-val-']")).toBeVisible();
});
