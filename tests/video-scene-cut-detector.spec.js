import { expect, test } from "@playwright/test";

test("video-scene-cut-detector renders controls and gates analysis", async ({ page }) => {
  await page.goto("http://localhost:3000/#/tools/video-scene-cut-detector");
  await expect(page.locator(".tool-header h1")).toHaveText("Video Scene Cut Detector");

  await expect(page.locator("#vsc-go")).toBeDisabled();
  await expect(page.locator("#vsc-copy-chapters")).toBeDisabled();
  await expect(page.locator("#vsc-copy-csv")).toBeDisabled();
  await expect(page.locator("#vsc-status")).toContainText("Load a video to begin");
  await expect(page.locator("#vsc-file")).toHaveAttribute("accept", "video/*");
});
